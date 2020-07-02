/**
 * functions about server
 */

const { getProgresser } = require('./streams')
const { logger } = require('../logger')
const { createServer, createConnection } = require('net')
const { createWriteStream } = require('fs')
const { createDecipheriv } = require('crypto')
const { decryptString, encryptString, cipherAlgorithm, decryptKey, verifyString } = require('./encrypt')
const { Stream } = require('stream')
const { createUnzip } = require('zlib')
const { getPrivateKey, getPublicKey } = require('./key.js')
const store = require('../renderer/store')
const status = require('../client/status')
const { ipcMain } = require('electron')

export let server = null

/**
 * find a useable port, start server and return the port
 * @returns {Promise} port
 */
export function startServer () {
  return new Promise((resolve, reject) => {
    if (server !== null) {
      server.end()
      server = null
    }

    server = createServer()
    server.on('listening', () => {
      logger.info(`P2P Server started on port: ${server.address().port}`)
      store.dispatch('setTransferPort', { port: server.address().port })
      resolve(server.address().port)
    })
    server.on('error', (e) => {
      logger.error(e)
      server = null
      reject(e)
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
  })
}

/**
 * start a server on connect()
 * @param {String} ip addr to connect
 * @param {Number} port port to connect
 */
export function serverConnect (ip, port) {
  let socket = createConnection(port, ip)
  let buffer = Buffer.alloc(0) // Data buffer per connection socket
  let state = { socket, buffer }
  socket.on('error', (err) => { logger.error(err) })
  logger.info(`Started P2P server on connection: ${socket.remoteAddress}:${socket.remotePort}`)
  socket.on('data', (data) => processData(data, state, onFileRequest))
  socket.on('close', () => {
    logger.info(`Connection from ${socket.remoteAddress}:${socket.remotePort} closed`)
  })
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
async function onFileRequest (data, socket) {
  let sig = data.signature
  delete data.signature
  data.verify = JSON.stringify(data)
  data.signature = sig
  let publicKey = await getPublicKey(data.userID)
  data.verified = verifyString(socket.sq + '\n' + data.verify, sig, publicKey)
  if (!data.verified) {
    logger.error(`data signature check failed: ${JSON.stringify(data)}`)
    socket.end()
  } else {
    delete data.verify
  }
  let privateKey = await getPrivateKey()
  data.key = decryptKey(data.key, privateKey)
  data.fileInfo = JSON.parse(decryptString(data.key.slice(0, 32), data.fileInfo))
  let _id = await store.dispatch('getId')
  let transferTask = {
    _id,
    sha1: data.fileInfo.sha1,
    size: data.fileInfo.size,
    filename: data.fileInfo.filename,
    from: `${socket.remoteAddress}:${socket.remotePort}`,
    isDownload: true,
    requestTime: new Date().toISOString(),
    deadline: data.deadline,
    mode: 0,
    status: status.transfer.REQUEST,
    filePath: ''
  }
  store.dispatch('createTransfer', transferTask)
  logger.info(`P2P file request: ${JSON.stringify(data)}`)
  socket._id = _id

  // TODO emit IPC event data.deadline
  ipcMain.once('fileRequest' + _id, (event, { accept, savePath }) => {
    if (accept) {
      acceptFileRequest(data, socket, savePath).catch((err) => { logger.error(err) })
    } else {
      rejectFileRequest(data, socket)
    }
  })
  ipcMain.once('cancelTransfer' + _id, (event) => {
    socket.end()
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
    throw err
  })
  let decipher = createDecipheriv(cipherAlgorithm, data.key.slice(0, 32), data.key.slice(32))
  let unzip = createUnzip()
  Stream.pipeline([socket, decipher, unzip, writeStream], () => {
    logger.info('data transfer finished.')
    store.dispatch('finishTransfer', { _id: socket._id })
  })
  writeStream.on('data', getProgresser(data.fileInfo.size, (e, speedData) => {
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
  callback(packet, socket)
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
