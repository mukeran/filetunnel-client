import { createConnection } from 'net'
import config from '../../config'
import { callbacks, transmitConnect } from '../../p2p/transmit'
import { logger } from '../../logger'
import { mainWindow } from '../../main'

/**
 * Handle server tunnel transmit request from server
 * Got transmit request, start a connection to server's transfer port,
 * and ready to receive P2P transfer request
 * Rejection is delayed after receiving fileInfo.
 * @param packet Received packet
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
 * Handle transmit ready signal from server
 * got transmitReady package, call registered action.
 * @param packet
 */
export function transmitReady (packet) {
  const { _id } = packet.data
  logger.debug(`get Transmit ready package ${JSON.stringify(packet)}`)
  const cb = callbacks.get(_id)
  cb().catch((err) => { logger.error(err) })
}
