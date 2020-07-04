import { decryptKey, verifyString } from '../p2p/encrypt'
import { getPrivateKey, getPublicKey } from '../p2p/key'
import { createWriteStream } from 'fs'
import { createDecipheriv } from 'crypto'
import { createGunzip } from 'zlib'
import request from '../client/request'
import status from '../client/status'
import net from 'net'
import config from '../config'
import store from '../renderer/store'
import { logger } from '../logger'
import { getProgress } from '../p2p/streams'

export async function validateSignature (fromUserId, filename, size, sha1, deadline, encryptedKey, signature) {
  const publicKey = await getPublicKey(fromUserId)
  let offlineTransfer = {
    userId: fromUserId,
    filename,
    size,
    sha1,
    deadline,
    encryptedKey
  }
  return verifyString(JSON.stringify(offlineTransfer), signature, publicKey)
}

async function startOfflineTransferUpload (socket) {
  const offlineTransfer = socket.offlineTransfer
  await store.dispatch('startTransfer', { _id: offlineTransfer._id })
  socket.removeAllListeners('data')
  const decipher = createDecipheriv(config.transfer.CIPHER_ALGORITHM,
    offlineTransfer.key.slice(0, 32), offlineTransfer.key.slice(32))
  const gunzip = createGunzip()
  const writeStream = createWriteStream(offlineTransfer.filePath)
  writeStream.on('error', err => {
    logger.error(err)
    store.dispatch('failTransfer', { _id: offlineTransfer._id })
  })
  socket
    .pipe(decipher)
    .pipe(gunzip)
    .pipe(writeStream)
  writeStream.on('close', () => {
    logger.info('Offline transfer download finished.')
    store.dispatch('finishTransfer', { _id: offlineTransfer._id })
  })
  gunzip.on('data', getProgress(offlineTransfer.size, (e, speedData) => {
    store.dispatch('updateSpeed', { _id: offlineTransfer._id, speedData })
  }))
}

export function acceptOfflineTransfer (_id, fromUserId, filename, filePath, size, sha1, encryptedKey) {
  return new Promise(async (resolve, reject) => {
    try {
      const packet = await request.answerOfflineTransfer(_id, 'accept')
      if (packet.status !== status.OK) {
        reject(new Error('Failed to answerOfflineTransfer'))
        return
      }
      const privateKey = await getPrivateKey()
      const key = decryptKey(encryptedKey, privateKey)
      let offlineTransfer = {
        _id,
        fromUserId,
        filename,
        filePath,
        size,
        sha1,
        key,
        isDownload: true,
        requestTime: new Date().toISOString(),
        mode: 2,
        status: status.transfer.CONNECTING
      }
      logger.debug(offlineTransfer)
      await store.dispatch('createTransfer', offlineTransfer)
      resolve()
      const socket = net.createConnection(config.server.TRANSFER_PORT, config.server.HOST)
      socket.offlineTransfer = offlineTransfer
      socket.on('connect', () => {
        socket.write(`2\n${packet.data.transferKey}\n`, () => {
          startOfflineTransferUpload(socket)
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}
