import { createConnection } from 'net'
import config from '../../config'
import { callbacks, transmitConnect } from '../../p2p/transmit'
import { logger } from '../../logger'

export function sendTransmit (packet) {
  const { _id } = packet.data
  let socket = createConnection(config.server.DATA_PORT, config.server.HOST)
  socket.on('error', (err) => { logger.error(err) })
  socket.on('close', () => {
    logger.info(`Transmit Connection for id: ${_id} closed`)
  })
  transmitConnect(socket)
  logger.debug('sendTransmit responsed')
  socket.write('0\n' + _id + '\n')
}

export function transmitReady (packet) {
  const { _id } = packet.data
  logger.debug(`get Transmit ready package ${JSON.stringify(packet)}`)
  const cb = callbacks.get(_id)
  cb().catch((err) => { logger.error(err) })
}
