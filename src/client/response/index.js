/**
 * Dispatch actions from server
 */
import { logger } from '../../logger'

const actions = {
  ...require('./friend'),
  ...require('./transmit')
}

/**
 * Dispatch actions
 * @param {Object} packet Received packet
 */
export function dispatch (packet) {
  logger.debug(`Got ${packet.action} packet`)
  if (typeof actions[packet.action] !== 'undefined') {
    actions[packet.action](packet)
  } else {
    logger.error(`Invalid action ${packet.action}`)
  }
}
