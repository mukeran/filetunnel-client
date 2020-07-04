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
import { processData, onFileRequest } from './server'
import { sendBySocket } from './client'

/* transmit(socket, uid, targetUid, deadline, filePath, size, sha1) */

export let callbacks = new Map()

export function connect (socket, transmitId, targetUid) {
  socket.write('0\n' + transmitId + '\n')
  callbacks.set(transmitId, async () => {
    let uid = store.state.user._id
    let _id = store.state.transfer._id
    await sendBySocket(socket, _id, uid, targetUid, socket.fileInfo.deadline, socket.fileInfo.filePath, socket.fileInfo.size, socket.fileInfo.sha1)
  })
}

export function transmitConnect (socket) {
  let buffer = Buffer.alloc(0) // Data buffer per connection socket
  let state = { socket, buffer }
  socket.on('error', (err) => { logger.error(err) })
  logger.info(`Started transmit server on connection: ${socket.remoteAddress}:${socket.remotePort}`)
  socket.on('data', (data) => processData(data, state, onFileRequest))
  socket.on('close', () => {
    logger.info(`Transmit Connection to ${socket.remoteAddress}:${socket.remotePort} closed`)
  })
}
