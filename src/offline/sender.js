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

/**
 * Process server connection's response
 * @param socket Socket instance
 * @returns {function(...[*]=)}
 */
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

/**
 * Start offline transfer upload procedure
 * @param socket Socket instance
 * @returns {Promise<void>}
 */
async function startOfflineTransferUpload (socket) {
  const offlineTransfer = socket.offlineTransfer
  await store.dispatch('startTransfer', { _id: offlineTransfer._id }) // Set start transfer status
  socket.removeAllListeners('data') // Remove all registered data event listener for socket
  /* Create read stream for file to upload 创建需要上传的文件的读取流（已压缩和加密的临时文件） */
  const readStream = createReadStream(offlineTransfer.tmpFilePath)
  readStream.on('error', err => {
    logger.error(err)
    store.dispatch('failTransfer', { _id: offlineTransfer._id }) // Update status when error
  })
  /* Pipe read stream to socket stream 将文件读取流管道连接至 socket */
  readStream.pipe(socket)
  socket.on('finish', () => {
    logger.debug(`Offline transfer ${offlineTransfer._id} finished`)
    store.dispatch('finishTransfer', { _id: offlineTransfer._id }) // Update status when finished
  })
  /* Register upload progress and speed updater */
  readStream.on('data', getProgress(offlineTransfer.tmpFileSize, (e, speedData) => {
    store.dispatch('updateSpeed', { _id: offlineTransfer._id, speedData })
  }))
}

/**
 * Compress and encrypt file content before upload
 * @param offlineTransfer
 * @returns {Promise<unknown>}
 */
function processOfflineTransferData (offlineTransfer) {
  return new Promise(async (resolve, reject) => {
    /* Set start status of processing progress */
    await store.dispatch('updateOfflineTransferDataProgress', { processedLength: 0 })
    await store.dispatch('showOfflineTransferDataProgress', true)
    /* Create read stream for original file 创建原始文件的读取流 */
    const readStream = createReadStream(offlineTransfer.path)
    readStream.on('error', err => {
      reject(err)
    })
    /* Create gzip stream 创建 gzip 压缩流 */
    const gzip = createGzip()
    /* Create AES-CBC cipher stream 创建 AES-CBC 加密流 */
    const cipher = createCipheriv(config.transfer.CIPHER_ALGORITHM,
      offlineTransfer.key.slice(0, 32), offlineTransfer.key.slice(32))
    /* Apply for temporary file 申请临时文件存储压缩加密后的内容 */
    const tmpFile = tmp.fileSync({ discardDescriptor: true })
    logger.debug(tmpFile)
    /* Create temporary file write stream 创建临时文件写入流 */
    const writeStream = createWriteStream(tmpFile.name)
    /* Pipe above stream 连接上述流 readStream->gzip->cipher->writeStream */
    readStream
      .pipe(gzip)
      .pipe(cipher)
      .pipe(writeStream)
    writeStream.on('close', () => {
      store.dispatch('showOfflineTransferDataProgress', false) // Update status when finished
      resolve(tmpFile.name)
    })
    /* Show compression and encryption progress */
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

/**
 * Request for offline transfer
 * @param userId UserId of receiver
 * @param path Path to file
 * @param size Size
 * @param sha1 SHA1
 * @param deadline Deadline to accept
 * @param from Receiver's username to display
 * @returns {Promise<unknown>}
 */
export function requestOfflineTransfer (userId, path, size, sha1, deadline, from) {
  return new Promise(async (resolve, reject) => {
    /* Obtain public key of receiver and private key of sender */
    const publicKey = await getPublicKey(userId)
    const privateKey = await getPrivateKey()
    /* Generate AES key and IV */
    const key = Buffer.concat([randomAESKey(), randomBytes(16)])
    let offlineTransfer = {
      userId,
      filename: basename(path),
      size,
      sha1,
      deadline,
      encryptedKey: encryptKey(key, publicKey)
    }
    /* Calculate signature of transfer */
    offlineTransfer.signature = signString(JSON.stringify(offlineTransfer), privateKey)
    /* Register offline transfer info */
    const packet = await request.requestOfflineTransfer(userId, offlineTransfer.filename, size, sha1, deadline,
      offlineTransfer.encryptedKey, offlineTransfer.signature)
    if (packet.status !== status.OK) {
      reject(packet)
      return
    }
    offlineTransfer = {
      ...offlineTransfer,
      _id: packet.data._id,
      key,
      path,
      isDownload: false,
      toUserId: userId,
      from: `${from} - 离线传输`,
      requestTime: new Date().toISOString(),
      mode: 2,
      status: status.transfer.CONNECTING
    }
    offlineTransfer.tmpFilePath = await processOfflineTransferData(offlineTransfer)
    offlineTransfer.tmpFileSize = statSync(offlineTransfer.tmpFilePath).size
    await store.dispatch('createTransfer', offlineTransfer) // Create transfer info
    /* Connect server's transfer port */
    const socket = net.createConnection(config.server.TRANSFER_PORT, config.server.HOST)
    resolve(offlineTransfer._id)
    socket.offlineTransfer = offlineTransfer
    /* Exchange information with server */
    socket.on('connect', () => {
      socket.write(`1\n${packet.data.transferKey}\n${offlineTransfer.tmpFileSize}\n`)
    })
    /* Process server's response */
    socket.on('data', processData(socket))
  })
}
