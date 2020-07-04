import { createConnection } from 'net'
import config from '../config'
import { callbacks, transmitConnect } from '../../p2p/transmit'

export function sendTransmit (packet) {
  const { _id } = packet.data
  let socket = createConnection(config.HOST, config.TRANSFER_PORT)
  transmitConnect(socket)
  socket.write('0\n' + _id + '\n')
}

export function transmitReady (packet) {
  const { _id } = packet.data
  callbacks.get(_id)()
}
