import config from '../config'
let logger = require('log4js').getLogger()

export let client
let retryCount = 0

export function connectServer () {
  const { PORT, HOST } = config.server
  const net = require('net')
  client = net.createConnection(PORT, HOST)
  client.on('connect', () => {
    retryCount = 0
    logger.info(`Connection established to ${HOST}:${PORT}`)
  })
  client.on('error', (err) => {
    logger.error(`Socket error: ${err}`)
    if (retryCount < config.connection.MAX_RETRY_TIMES) {
      retryCount++
      logger.log(`Trying to reconnect. ${retryCount}`)
      connectServer()
    }
  })
}

export function createPackage (payload) {
  const data = JSON.stringify(payload)
  return data.length + '\n' + data
}
