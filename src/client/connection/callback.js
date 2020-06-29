/**
 * Request callback pool
 */
import config from '../../config'

const callbacks = new Map() // Callback sequence number to function mappings
let sq = Math.round(Math.random() * 100) // Current Sequence number

/**
 * Register callback
 * @param {Function} callback
 * @returns {number} sq
 */
function register (callback) {
  sq = (sq + 1) % config.connection.MAX_SEQUENCE_NUMBER
  while (callbacks.has(sq)) {
    sq = (sq + 1) % config.connection.MAX_SEQUENCE_NUMBER
  }
  callbacks.set(sq, callback)
  return sq
}

/**
 * Get callback by sq
 * @param {number} sq Sequence number
 * @returns {Function} callback
 */
function get (sq) {
  return callbacks.get(sq)
}

/**
 * Delete callback by sq
 * @param {number} sq Sequence number
 */
function del (sq) {
  callbacks.delete(sq)
}

export default {
  register,
  get,
  del
}
