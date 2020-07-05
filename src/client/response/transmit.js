import { createConnection } from 'net'
import config from '../../config'
import { callbacks, transmitConnect } from '../../p2p/transmit'
import { logger } from '../../logger'
import { mainWindow } from '../../main'

/**
 * 发送服务器中转文件
 * @param {*} packet 数据
 */
export function sendTransmit (packet) {
  const { _id } = packet.data
  let socket = createConnection(config.server.TRANSFER_PORT, config.server.HOST)
  socket.on('error', (err) => {
    logger.error(err)
    mainWindow.webContents.send('message', { title: '出现中转请求失败', type: 'error' })
  })
  socket.on('close', () => {
    logger.info(`Transmit Connection for id: ${_id} closed`)
  })
  transmitConnect(socket)
  logger.debug('sendTransmit responsed')
  socket.write('0\n' + _id + '\n')
}
/**
 * 接收到transmitReady指令，准备开始传输
 * @param {} packet
 */
export function transmitReady (packet) {
  const { _id } = packet.data
  logger.debug(`get Transmit ready package ${JSON.stringify(packet)}`)
  const cb = callbacks.get(_id)
  cb().catch((err) => { logger.error(err) })
}
