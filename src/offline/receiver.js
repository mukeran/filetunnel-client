/**
 * All receiver functions of offline transfer
 */
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

/**
 * Validate signature of a offline transfer
 * @param fromUserId UserId of sender
 * @param filename Filename
 * @param size Size
 * @param sha1 SHA1
 * @param deadline Deadline to receive file
 * @param encryptedKey Encrypted AES key
 * @param signature Signature of file
 * @returns {Promise<boolean>}
 */
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

/**
 * Start offline transfer download procedure
 * @param socket Connection's socket instance
 * @returns {Promise<void>}
 */
async function startOfflineTransferDownload (socket) {
  const offlineTransfer = socket.offlineTransfer
  await store.dispatch('startTransfer', { _id: offlineTransfer._id }) // Set start transfer status
  socket.removeAllListeners('data') // Remove all registered data event listener for socket
  /* Create AES decipher stream 创建 AES-CBC 解密流 */
  const decipher = createDecipheriv(config.transfer.CIPHER_ALGORITHM,
    offlineTransfer.key.slice(0, 32), offlineTransfer.key.slice(32))
  /* Create gunzip stream 创建 gzip 解压流 */
  const gunzip = createGunzip()
  /* Create file write stream 创建目标文件写入流 */
  const writeStream = createWriteStream(offlineTransfer.filePath)
  writeStream.on('error', err => {
    logger.error(err)
    store.dispatch('failTransfer', { _id: offlineTransfer._id }) // Update status when error
  })
  /* Pipe these streams. socket->decipher->gunzip->writeStream */
  socket
    .pipe(decipher)
    .pipe(gunzip)
    .pipe(writeStream)
  writeStream.on('close', () => {
    logger.info('Offline transfer download finished.')
    store.dispatch('finishTransfer', { _id: offlineTransfer._id }) // Update status when finished
  })
  /* Register download progress and speed updater */
  gunzip.on('data', getProgress(offlineTransfer.size, (e, speedData) => {
    store.dispatch('updateSpeed', { _id: offlineTransfer._id, speedData })
  }))
}

/**
 * Accept an offline transfer
 * @param _id offlineTransferId
 * @param fromUserId Sender's userId
 * @param filename Filename
 * @param filePath Path to save file
 * @param size Size
 * @param sha1 SHA1
 * @param encryptedKey Encrypted AES key
 * @param from Sender's username
 * @returns {Promise<unknown>}
 */
export function acceptOfflineTransfer (_id, fromUserId, filename, filePath, size, sha1, encryptedKey, from) {
  return new Promise(async (resolve, reject) => {
    try {
      /* Get transferKey */
      const packet = await request.answerOfflineTransfer(_id, 'accept')
      if (packet.status !== status.OK) {
        reject(new Error('Failed to answerOfflineTransfer'))
        return
      }
      /* Decrypt encrypted key */
      const privateKey = await getPrivateKey()
      const key = decryptKey(encryptedKey, privateKey)
      /* Create transfer entry */
      let offlineTransfer = {
        _id,
        fromUserId,
        from: `${from} - 离线传输`,
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
      await store.dispatch('createTransfer', offlineTransfer) // Create transfer display entry
      resolve()
      /* Create transfer port connection */
      const socket = net.createConnection(config.server.TRANSFER_PORT, config.server.HOST)
      socket.offlineTransfer = offlineTransfer
      /* Exchange information with server */
      socket.on('connect', () => {
        socket.write(`2\n${packet.data.transferKey}\n`, () => {
          startOfflineTransferDownload(socket)
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}
