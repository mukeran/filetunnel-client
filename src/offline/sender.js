import { getPrivateKey, getPublicKey } from '../p2p/key'
import { encryptKey, randomAESKey, signString } from '../p2p/encrypt'
import { randomBytes, createCipheriv } from 'crypto'
import { createReadStream, createWriteStream, statSync } from 'fs'
import { basename } from 'path'
import { createGzip } from 'zlib'
import request from '../client/request'
import net from 'net'
import config from '../config'
import status from '../client/status'
import { logger } from '../logger'
import store from '../renderer/store'
import { getProgress } from '../p2p/streams'
import tmp from 'tmp'

function processData (socket) {
  let buffer = Buffer.alloc(0)
  return async (data) => {
    logger.debug(`Receiving data ${data}`)
    buffer = Buffer.concat([buffer, data])
    if (buffer.slice(0, 2).toString() === 'ok') {
      return startOfflineTransferUpload(socket)
    }
  }
}

async function startOfflineTransferUpload (socket) {
  const offlineTransfer = socket.offlineTransfer
  await store.dispatch('startTransfer', { _id: offlineTransfer._id })
  socket.removeAllListeners('data')
  const readStream = createReadStream(offlineTransfer.tmpFilePath)
  readStream.on('error', err => {
    logger.error(err)
    store.dispatch('failTransfer', { _id: offlineTransfer._id })
  })
  readStream.pipe(socket)
  socket.on('finish', () => {
    logger.debug(`Offline transfer ${offlineTransfer._id} finished`)
    store.dispatch('finishTransfer', { _id: offlineTransfer._id })
  })
  readStream.on('data', getProgress(offlineTransfer.tmpFileSize, (e, speedData) => {
    store.dispatch('updateSpeed', { _id: offlineTransfer._id, speedData })
  }))
}

function processOfflineTransferData (offlineTransfer) {
  return new Promise(async (resolve, reject) => {
    await store.dispatch('updateOfflineTransferDataProgress', { processedLength: 0 })
    await store.dispatch('showOfflineTransferDataProgress', true)
    const readStream = createReadStream(offlineTransfer.path)
    readStream.on('error', err => {
      reject(err)
    })
    const gzip = createGzip()
    const cipher = createCipheriv(config.transfer.CIPHER_ALGORITHM,
      offlineTransfer.key.slice(0, 32), offlineTransfer.key.slice(32))
    const tmpFile = tmp.fileSync({ discardDescriptor: true })
    logger.debug(tmpFile)
    const writeStream = createWriteStream(tmpFile.name)
    readStream
      .pipe(gzip)
      .pipe(cipher)
      .pipe(writeStream)
    writeStream.on('close', () => {
      store.dispatch('showOfflineTransferDataProgress', false)
      resolve(tmpFile.name)
    })
    cipher.on('data', (function () {
      let processedLength = 0
      let timeout = null
      return (data) => {
        processedLength += data.length
        if (timeout !== null) return
        timeout = setTimeout(() => { timeout = null }, 1000)
        store.dispatch('updateOfflineTransferDataProgress', { processedLength })
      }
    })())
  })
}

export function requestOfflineTransfer (userId, path, size, sha1, deadline) {
  return new Promise(async (resolve, reject) => {
    const publicKey = await getPublicKey(userId)
    const privateKey = await getPrivateKey()
    const key = Buffer.concat([randomAESKey(), randomBytes(16)])
    let offlineTransfer = {
      userId,
      filename: basename(path),
      size,
      sha1,
      deadline,
      encryptedKey: encryptKey(key, publicKey)
    }
    offlineTransfer.signature = signString(JSON.stringify(offlineTransfer), privateKey)
    const packet = await request.requestOfflineTransfer(userId, offlineTransfer.filename, size, sha1, deadline,
      offlineTransfer.encryptedKey, offlineTransfer.signature)
    if (packet.status !== status.OK) {
      reject(new Error('Failed to requestOfflineTransfer'))
      return
    }
    offlineTransfer = {
      ...offlineTransfer,
      _id: packet.data._id,
      key,
      path,
      isDownload: false,
      toUserId: userId,
      requestTime: new Date().toISOString(),
      mode: 2,
      status: status.transfer.CONNECTING
    }
    offlineTransfer.tmpFilePath = await processOfflineTransferData(offlineTransfer)
    offlineTransfer.tmpFileSize = statSync(offlineTransfer.tmpFilePath).size
    await store.dispatch('createTransfer', offlineTransfer)
    const socket = net.createConnection(config.server.TRANSFER_PORT, config.server.HOST)
    resolve(offlineTransfer._id)
    socket.offlineTransfer = offlineTransfer
    socket.on('connect', () => {
      socket.write(`1\n${packet.data.transferKey}\n${offlineTransfer.tmpFileSize}\n`)
    })
    socket.on('data', processData(socket))
  })
}
