/**
 * functions about server
 */

import request from '../client/request'
import { mainWindow } from '../main'

const { getProgress } = require('./streams')
const { logger } = require('../logger')
const { createServer } = require('net')
const { createWriteStream } = require('fs')
const { createDecipheriv } = require('crypto')
const { decryptString, encryptString, cipherAlgorithm, decryptKey, verifyString } = require('./encrypt')
const { createUnzip } = require('zlib')
const { getPrivateKey, getPublicKey } = require('./key.js')
const store = require('../renderer/store').default
const status = require('../client/status').default
const { ipcMain } = require('electron')

export let server = null

/**
 * find a useable port, start server and return the port
 * @returns {Promise} port
 */
export function startServer () {
  if (server !== null) {
    server.close()
    server = null
  }
  server = createServer()
  server.on('listening', () => {
    logger.info(`P2P Server started on port: ${server.address().port}`)
    store.dispatch('updateEnableP2PTransfer', { enableP2PTransfer: true })
    store.dispatch('updateTransferPort', { port: server.address().port })
    request.updateTransferPort(server.address().port)
  })
  server.on('error', (e) => {
    logger.error(e)
    // store.dispatch('updateEnableP2PTransfer', { enableP2PTransfer: false })
    // store.dispatch('updateTransferPort', { port: 0 })
    // server = null
  })
  server.on('close', () => {
    logger.debug('P2P server closed')
    store.dispatch('updateEnableP2PTransfer', { enableP2PTransfer: false })
    store.dispatch('updateTransferPort', { port: 0 })
    request.updateTransferPort(0)
    server = null
  })
  server.on('connection', (socket) => {
    let buffer = Buffer.alloc(0) // Data buffer per connection socket
    let state = { socket, buffer }
    logger.info(`Received connection from ${socket.remoteAddress}:${socket.remotePort}`)
    socket.on('error', (err) => { logger.error(err) })
    socket.on('data', (data) => processData(data, state, onFileRequest))
    socket.on('close', () => {
      logger.info(`Connection from ${socket.remoteAddress}:${socket.remotePort} closed`)
    })
  })
  logger.info(`P2P server starting ...`)
  server.listen(0) // listen on random port (provided by os)
}

/**
 * stops started P2P server
 */
export function stopServer () {
  if (server !== null) {
    server.close()
    server = null
  }
}

/**
 * callback function on P2P file request
 * @param {Object} data the request received
 * @param {Socket} socket
 */
export async function onFileRequest (data, socket, mode) {
  let sig = data.signature
  delete data.signature
  data.verify = JSON.stringify(data)
  data.signature = sig
  let publicKey = await getPublicKey(data.userID)
  logger.debug('sender public key: ' + publicKey)
  logger.debug('data to verify: ' + data.verify)
  data.verified = verifyString(socket.sq + '\n' + data.verify, sig, publicKey)
  if (!data.verified) {
    mainWindow.webContents.send('message', { title: '新的文件传输请求校验错误', duration: 0 })
    logger.error(`data signature check failed: ${JSON.stringify(data)}`)
    socket.end()
  } else {
    delete data.verify
  }
  let privateKey = await getPrivateKey()
  logger.debug('my private key: ' + privateKey)
  data.key = decryptKey(data.key, privateKey)
  data.fileInfo = JSON.parse(decryptString(data.key.slice(0, 32), data.fileInfo))
  let _id = store.state.transfer._id
  await store.dispatch('getId')
  let transferTask = {
    _id,
    sha1: data.fileInfo.sha1,
    size: data.fileInfo.size,
    filename: data.fileInfo.filename,
    from: `${socket.remoteAddress}:${socket.remotePort}`,
    isDownload: true,
    requestTime: new Date().toISOString(),
    deadline: data.deadline,
    mode: mode || 0,
    status: status.transfer.REQUEST,
    filePath: ''
  }
  await store.dispatch('createTransfer', transferTask)
  mainWindow.webContents.send('message', { title: '收到新的文件传输请求', duration: 0 })
  logger.info(`P2P file request: ${JSON.stringify(data)}`)
  socket._id = _id

  // TODO emit IPC event data.deadline
  ipcMain.once('fileRequest' + _id, (event, { accept, filePath }) => {
    if (accept) {
      logger.debug('fileRequest' + _id + ' is accepted')
      acceptFileRequest(data, socket, filePath).catch((err) => { logger.error(err) })
    } else {
      logger.debug('fileRequest' + _id + ' is accepted')
      rejectFileRequest(data, socket)
    }
  })
  ipcMain.once('cancelTransfer' + _id, (event) => {
    socket.end()
    store.dispatch('failTransfer', { _id: socket._id })
  })
  socket.on('end', () => {
    ipcMain.removeAllListeners(['fileRequest' + _id, 'cancelTransfer' + _id])
  })
}

/**
 * as a callback for IPC after user acception
 * @param {Object} data
 * @param {Socket} socket
 * @param {String} savePath
 */
export async function acceptFileRequest (data, socket, savePath) {
  let rdata = { isAccepted: true }
  rdata.encryptedNonce = encryptString(data.key.slice(0, 32), data.nonce)
  socket.removeAllListeners(['data'])
  socket.write(packData(Buffer.from(JSON.stringify(rdata)), socket.sq))
  logger.info('data transfer started.')

  store.dispatch('startTransfer', { _id: socket._id })

  let writeStream = createWriteStream(savePath)
  writeStream.on('error', (err) => {
    logger.error(err)
    store.dispatch('failTransfer', { _id: socket._id })
    // throw err
  })
  let decipher = createDecipheriv(cipherAlgorithm, data.key.slice(0, 32), data.key.slice(32))
  decipher.on('error', (err) => {
    logger.error(err)
    store.dispatch('failTransfer', { _id: socket._id })
    // throw err
  })
  let unzip = createUnzip()
  // stream.pipeline([socket, decipher, unzip, writeStream], () => {
  //   logger.info('data transfer finished.')
  //   store.dispatch('finishTransfer', { _id: socket._id })
  // })
  socket
    .pipe(decipher)
    .pipe(unzip)
    .pipe(writeStream)
  writeStream.on('close', () => {
    logger.info('data transfer finished.')
    store.dispatch('finishTransfer', { _id: socket._id })
  })
  unzip.on('data', getProgress(data.fileInfo.size, (e, speedData) => {
    store.dispatch('updateSpeed', { _id: socket._id, speedData })
  }))
}

/**
 * callback for rejection
 * @param {Object} data
 * @param {Socket} socket
 */
export function rejectFileRequest (data, socket) {
  // emit IPC event
  let rdata = { isAccepted: false }
  logger.info('Request rejected.')
  store.dispatch('rejectTransfer', { _id: socket._id })
  socket.write(packData(Buffer.from(JSON.stringify(rdata)), socket.sq))
  socket.end()
}

/**
 * buffer process on socket connection
 * @param {Object} data
 * @param {Object} pdata
 * @param {Function} callback
 */
export function processData (data, pdata, callback) {
  let socket = pdata.socket
  logger.debug(`Receiving p2p data from ${socket.remoteAddress}:${socket.remotePort}`)

  pdata.buffer = Buffer.concat([pdata.buffer, data])
  /* Find the end symbol of size (LF) */
  let pos1 = pdata.buffer.indexOf('\n')
  if (pos1 === -1) {
    logger.info('Received incomplete payload')
    return
  }
  /* Get the size of payload */
  let size = parseInt(pdata.buffer.slice(0, pos1).toString())
  if (isNaN(size) || size <= 1) {
    logger.error(`Wrong payload size: ${pdata.buffer.slice(0, pos1).toString()}`)
    socket.end()
    return
  }
  if ((pdata.buffer.length - pos1 - 1) < size) {
    logger.info('Received incomplete payload')
    return
  }

  let pos2 = pdata.buffer.indexOf('\n', pos1 + 1)
  if (pos2 === -1) {
    logger.info('Received incomplete payload')
    return
  }
  let sq = parseInt(pdata.buffer.slice(pos1 + 1, pos2).toString())
  if (isNaN(sq)) {
    logger.error(`Wrong payload sq: ${pdata.buffer.slice(pos1, pos2)}`)
    socket.end()
    return
  }
  pdata.buffer = pdata.buffer.slice(pos2 + 1)
  size = size - (pos2 - pos1)

  let packet
  try {
    packet = JSON.parse(pdata.buffer.slice(0, size).toString())
  } catch (e) {
    logger.error(`Invalid JSON format: ${pdata.buffer.slice(0, size).toString()}`)
    return
  } finally {
    pdata.buffer = pdata.buffer.slice(size)
  }
  logger.debug(`Received data: ${JSON.stringify(packet)}`)
  if (typeof socket.sq !== 'undefined') {
    if (sq !== socket.sq) {
      logger.error('Wrong sq detected.')
    }
  }
  socket.sq = sq
  callback(packet, socket, pdata.mode).catch(err => { logger.error(err) })
}

/**
 * pack size and sq before sending
 * @param {*} data
 * @param {Number} sq
 */
export function packData (data, sq) {
  let buf = Buffer.concat([Buffer.from(sq + '\n'), data])
  return Buffer.concat([Buffer.from(buf.length + '\n'), buf])
}
