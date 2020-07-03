import { createConnection } from 'net'
import config from '../config'
import { onFileRequest, processData } from '../../p2p/server'
const { logger } = require('../logger')

export function sendTransmit (packet) {
  const { _id } = packet.data
  let socket = createConnection(config.HOST, config.DATA_PORT)
  socket.write('0\n' + _id + '\n')
  TransferServerConnect(socket)
}
export function TransferServerConnect (socket) {
  let buffer = Buffer.alloc(0) // Data buffer per connection socket
  let state = { socket, buffer }
  socket.on('error', (err) => { logger.error(err) })
  logger.info(`Started transfer server on connection: ${socket.remoteAddress}:${socket.remotePort}`)
  socket.on('data', (data) => processData(data, state, onFileRequest))
  socket.on('close', () => {
    logger.info(`Connection from ${socket.remoteAddress}:${socket.remotePort} closed`)
  })
}
