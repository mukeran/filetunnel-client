/**
 * 发送中转文件的具体流程
 * 已经返回了一个 transmitId
 * 1. transmit('0\n'+transmitId+'\n')
 * .then(packet)
 * packet.data = transmit ready
 * 开始 transmit 文件
 *
 * 整体封装成一个大函数
 *
 *  let socket = createConnection(config.HOST, config.TRANSFER_PORT)
 *  socket.write('0\n'+transmitId+'\n')
 * .then(transmitready)
 *    transmit(socket, uid, targetUid, deadline, filePath, size, sha1)
 */

import store from '../renderer/store'
import { logger } from '../logger'
import { processData, onFileRequest, getFriendName } from './server'
import { sendBySocket } from './client'
import { basename } from 'path'
import status from '../client/status'

/* transmit(socket, uid, targetUid, deadline, filePath, size, sha1) */

export let callbacks = new Map()

export function connect (socket, transmitId, targetUid) {
  socket.write('0\n' + transmitId + '\n')

  callbacks.set(transmitId, async () => {
    let uid = store.state.user._id
    let tid = store.state.transfer._id
    await store.dispatch('getId')
    let filename = basename(socket.fileInfo.filePath)
    logger.debug(`P2P new transfer list _id ${tid}`)
    let transferTask = {
      _id: tid,
      sha1: socket.fileInfo.sha1,
      size: socket.fileInfo.size,
      filename,
      filePath: socket.fileInfo.filePath,
      from: `${getFriendName(targetUid)} - 服务器中转`,
      isDownload: false,
      requestTime: new Date().toISOString(),
      deadline: socket.fileInfo.deadline,
      mode: 1,
      status: status.transfer.PENDING
    }
    store.dispatch('createTransfer', transferTask)
    await sendBySocket(socket, tid, uid, targetUid, socket.fileInfo.deadline, socket.fileInfo.filePath, socket.fileInfo.size, socket.fileInfo.sha1)
  })
  logger.debug('connect registered callback')
  logger.debug(callbacks)
}

export function transmitConnect (socket) {
  let buffer = Buffer.alloc(0) // Data buffer per connection socket
  let state = { socket, buffer, mode: 1 }
  logger.info(`Started transmit server on connection: ${socket.remoteAddress}:${socket.remotePort}`)
  socket.on('data', (data) => processData(data, state, onFileRequest))
}
