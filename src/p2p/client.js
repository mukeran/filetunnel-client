import { getProgress } from './streams'
import { ipcMain } from 'electron'

const { logger } = require('../logger')
const { createConnection } = require('net')
const { statSync, createReadStream } = require('fs')
const { basename } = require('path')
const { createHash, randomBytes, createCipheriv } = require('crypto')
const { randomAESKey, randomNonce, decryptString, encryptString, cipherAlgorithm, signString, encryptKey } = require('./encrypt')
const { createGzip } = require('zlib')
const { processData, packData } = require('./server')
const { getPublicKey, getPrivateKey } = require('./key')
const store = require('../renderer/store').default
const status = require('../client/status').default

export function getFileInfo (path) {
  return new Promise((resolve, reject) => {
    let stat = statSync(path)
    let sha1 = createHash('sha1')
    let f = createReadStream(path)
    f.on('data', data => sha1.update(data))
    f.on('end', () => { resolve({ filename: basename(path), size: stat['size'], sha1: sha1.digest('hex') }) })
  })
}

export async function sendCalcHash (ip, port, deadline, uid, targetUid, filePath) {
  let _id = store.state.transfer._id
  await store.dispatch('getId')
  let filename = basename(filePath)
  let transferTask = {
    _id,
    sha1: 'Calculating...',
    size: 0,
    filename,
    from: `${ip}:${port}`,
    isDownload: false,
    requestTime: new Date().toISOString(),
    deadline,
    mode: 0,
    status: status.transfer.CONNECTING
  }
  store.dispatch('createTransfer', transferTask)
  let publicKey = await getPublicKey(targetUid)
  let privateKey = await getPrivateKey()
  let data = { userID: uid, deadline: deadline, nonce: randomNonce() }
  let pFile = getFileInfo(filePath).catch(err => {
    store.dispatch('failTransfer', { _id })
    logger.error(err)
    throw err
  })

  let key = Buffer.concat([randomAESKey(), randomBytes(16)])
  data.key = encryptKey(key, publicKey)

  await pFile.then(info => {
    store.dispatch('updateHash', { _id, sha1: info.sha1, size: info.size })
    data.fileInfo = encryptString(key.slice(0, 32), Buffer.from(JSON.stringify(info)))
    pFile = info
  })

  let sq = parseInt(randomBytes(4).toString('hex'), 16)
  let sig = signString(sq + '\n' + JSON.stringify(data), privateKey)
  data.signature = sig
  let client = createConnection(port, ip)
  client.on('error', (err) => {
    store.dispatch('failTransfer', { _id })
    logger.error(err)
    throw err
  })
  let sData = packData(Buffer.from(JSON.stringify(data)), sq)
  data.sq = sq
  data.key = key
  data.path = filePath
  data.fileInfo = pFile
  client.fData = data
  client._id = _id
  let buffer = Buffer.alloc(0)
  let state = { socket: client, buffer }
  client.on('data', (data) => processData(data, state, onFileResponse))
  logger.info(`P2P send Request: ${JSON.stringify(data)}`)
  logger.debug(`P2P send request binary data: ${sData.toString()} `)
  client.write(sData)
}

export async function send (ip, port, uid, targetUid, deadline, filePath, size, sha1) {
  let _id = store.state.transfer._id
  await store.dispatch('getId')
  let filename = basename(filePath)
  let transferTask = {
    _id,
    sha1,
    size,
    filename,
    filePath,
    from: `${ip}:${port}`,
    isDownload: false,
    requestTime: new Date().toISOString(),
    deadline,
    mode: 0,
    status: status.transfer.PENDING
  }
  store.dispatch('createTransfer', transferTask)
  let publicKey = await getPublicKey(targetUid)
  let privateKey = await getPrivateKey()
  logger.debug('myPrivateKey: ' + privateKey)
  logger.debug('targetPublicKey: ' + publicKey)
  let data = { userID: uid, deadline: deadline, nonce: randomNonce() }

  let key = Buffer.concat([randomAESKey(), randomBytes(16)])
  data.key = encryptKey(key, publicKey)
  let info = { filename, size, sha1 }
  data.fileInfo = encryptString(key.slice(0, 32), Buffer.from(JSON.stringify(info)))

  let sq = parseInt(randomBytes(4).toString('hex'), 16)
  let sig = signString(sq + '\n' + JSON.stringify(data), privateKey)
  logger.debug('data to sign: ' + JSON.stringify(data))
  data.signature = sig
  let client = createConnection(port, ip)
  client.on('error', (err) => {
    store.dispatch('failTransfer', { _id })
    logger.error(err)
    throw err
  })
  logger.debug(data)
  let sData = packData(Buffer.from(JSON.stringify(data)), sq)
  data.sq = sq
  data.key = key
  data.path = filePath
  data.fileInfo = info
  client.fData = data
  client._id = _id
  let buffer = Buffer.alloc(0)
  let state = { socket: client, buffer }
  client.on('data', (data) => processData(data, state, onFileResponse))

  ipcMain.once('cancelTransfer' + _id, (event) => {
    client.end()
  })
  client.on('end', () => {
    ipcMain.removeAllListeners(['cancelTransfer' + _id])
  })

  logger.info(`P2P send Request: ${JSON.stringify(data)}`)
  logger.debug(`P2P send request binary data: ${sData.toString()} `)
  client.write(sData)
}

async function onFileResponse (data, socket) {
  if (!data.isAccepted) {
    logger.warn('transfer rejected..')
    store.dispatch('rejectTransfer', { _id: socket._id })
    socket.end()
    return
  }
  let decNonce = decryptString(socket.fData.key.slice(0, 32), data.encryptedNonce)
  if (socket.fData.nonce !== decNonce) {
    logger.error(`key exchange failed: ${decNonce} not ${socket.fData.nonce}`)
    store.dispatch('failTransfer', { _id: socket._id })
    socket.end()
    return
  }
  let readStream = createReadStream(socket.fData.path)
  readStream.on('error', (err) => {
    logger.error(err)
    store.dispatch('failTransfer', { _id: socket._id })
    throw err
  })
  let cipher = createCipheriv(cipherAlgorithm, socket.fData.key.slice(0, 32), socket.fData.key.slice(32))
  let gzip = createGzip()
  logger.info('transfer started.')
  store.dispatch('startTransfer', { _id: socket._id })
  // stream.pipeline([readStream, gzip, cipher, socket], () => {
  //   logger.info('data transfer finished.')
  //   store.dispatch('finishTransfer', { _id: socket._id })
  // })
  readStream
    .pipe(gzip)
    .pipe(cipher)
    .pipe(socket)
  socket.on('finish', () => {
    logger.info('data transfer finished.')
    store.dispatch('finishTransfer', { _id: socket._id })
  })
  readStream.on('data', getProgress(socket.fData.fileInfo.size, (e, speedData) => {
    store.dispatch('updateSpeed', { _id: socket._id, speedData })
  }))
}
