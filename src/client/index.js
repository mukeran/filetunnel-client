/**
 * Client functions
 */
import config from '../config'
import { logger } from '../logger'
import callback from './connection/callback'
import { dispatch } from './response'
import store from '../renderer/store'
import request from './request'
import status from './status'

let buffer = Buffer.alloc(0) // Data buffer
let isProcessingData = false // Mutex to prevent same time data process
/**
 * Process received data from server
 * @param {Buffer} data Data received
 */
function processData (data) {
  logger.debug(`Receiving data ${data}`)
  /* Concat to existed buffer */
  buffer = Buffer.concat([buffer, data])
  if (isProcessingData) return
  while (true) {
    isProcessingData = true
    /* Find the end symbol of size (LF) */
    let pos = buffer.indexOf('\n')
    if (pos === -1) {
      logger.info('No next payload')
      break
    }
    /* Get the size of payload */
    let size = parseInt(buffer.slice(0, pos).toString())
    if (size <= 1) {
      logger.error(`Wrong payload size: ${size}`)
      break
    }
    /* Check if received incomplete payload */
    if (buffer.length - pos - 1 < size) {
      logger.info('Received incomplete payload')
      break
    }
    buffer = buffer.slice(pos + 1)
    const tmp = buffer.slice(0, size).toString()
    buffer = buffer.slice(size)
    /* Convert JSON to Object. Detect parse error */
    let packet
    try {
      packet = JSON.parse(tmp)
    } catch (e) {
      logger.error('Invalid JSON format')
      break
    }
    logger.debug(packet)
    if (typeof packet.action !== 'undefined') {
      /* Do client request when request exists in packet */
      dispatch(packet)
    } else if (typeof packet.sq !== 'undefined') {
      /* Undefined request indicates that the packet is a response */
      const cb = callback.get(packet.sq) // Get resolve callback from pool
      if (typeof cb !== 'undefined') {
        callback.del(packet.sq) // Delete callback when succeeded
        logger.info(`Received packet ${packet.sq} response`)
        cb(packet) // Call callback
      } else {
        /* If there's no recorded callback, it is timeout or fake */
        logger.info(`Received invalid packet ${packet.sq}`)
      }
    } else {
      logger.error('Invalid packet format')
    }
  }
  isProcessingData = false
}

/**
 * Package packet into payload
 * @param {Object} packet Packet to send
 * @returns {Buffer} Packaged payload
 */
function createPayload (packet) {
  const data = Buffer.from(JSON.stringify(packet))
  return Buffer.concat([Buffer.from(data.length.toString()), Buffer.from('\n'), data]) // Add data.length info
}

let aliveTimeout = null
let doStopAliveTimeout = false // Stop alive timeout signal
/**
 * Register alive timeout
 */
export function registerAliveTimeout (isFirst = false) {
  if (aliveTimeout !== null) {
    clearTimeout(aliveTimeout)
    aliveTimeout = null
  }
  doStopAliveTimeout = false
  aliveTimeout = setTimeout(() => {
    aliveTimeout = null
    request.alive()
      .then(() => {
        if (!doStopAliveTimeout) {
          registerAliveTimeout()
        }
      })
      .catch(async () => {
        logger.error('Alive timeout')
        if (client !== null) {
          client.end()
          client = null
        }
        await store.dispatch('updateConnectionStatus', { connectionStatus: status.connection.DISCONNECTED })
      })
  }, isFirst ? 0 : config.connection.ALIVE_PERIOD)
}

/**
 * Stop alive timeout
 */
export function stopAliveTimeout () {
  if (aliveTimeout !== null) {
    clearTimeout(aliveTimeout)
    aliveTimeout = null
  } else {
    doStopAliveTimeout = true
  }
}

export let client = null // Socket instance

/**
 * Connect to server
 */
export async function connectServer () {
  /* Clear current connection */
  if (client !== null) {
    client.end()
    client = null
  }
  /* Create socket connection to server */
  const { PORT, HOST } = config.server
  const net = require('net')
  logger.info(`Establishing connection`)
  await store.dispatch('updateConnectionStatus', { connectionStatus: status.connection.CONNECTING })
  client = net.createConnection(PORT, HOST)
  /* Event when connected */
  client.on('connect', async () => {
    await store.dispatch('updateConnectionStatus', { connectionStatus: status.connection.CONNECTED })
    logger.info(`Connection established to ${HOST}:${PORT}`)
    registerAliveTimeout()
  })
  /* Event when connection ended */
  client.on('end', async () => {
    await store.dispatch('updateConnectionStatus', { connectionStatus: status.connection.DISCONNECTED })
    logger.info('Connection ended')
    stopAliveTimeout()
    client = null
  })
  /* Event when error occurs */
  client.on('error', async (err) => {
    await store.dispatch('updateConnectionStatus', { connectionStatus: status.connection.DISCONNECTED })
    logger.error(`Socket error: ${err}`)
  })
  /* Event when receiving data */
  client.on('data', processData)
}

/**
 * Send request to server
 * @param packet Packet to send
 * @param timeout Milliseconds after when the packet is expired
 * @returns {Promise<unknown>}
 */
export function sendRequest (packet, timeout = config.connection.RESPONSE_TIMEOUT) {
  return new Promise((resolve, reject) => {
    if (client === null) {
      reject(new Error('Not connected'))
    }
    /* Register resolve callback and add sq to packet */
    const sq = callback.register(resolve)
    packet = { ...packet, sq }
    let payload = createPayload(packet)
    logger.debug(`Sending payload ${payload}`)
    /* Send payload */
    client.write(payload, () => setTimeout(() => {
      /* Report timeout when not receiving response after a specific timeout */
      callback.del(sq)
      reject(new Error('Response timeout'))
    }, timeout))
  })
}

/**
 * Send response of server's request
 * @param packet Packet to send
 * @param reqPacket Original request packet
 */
export function sendResponse (packet, reqPacket) {
  const payload = createPayload({ ...packet, sq: reqPacket.sq })
  logger.debug(`Ready to send payload ${payload}`)
  client.write(payload, () => {
    logger.debug(`Sent payload ${payload}`)
  })
}
