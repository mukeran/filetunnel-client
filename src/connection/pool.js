import config from '../config'

let callbacks = new Map()
let sequenceNumber = Math.round(Math.random() * 100)

export function register (callback) {
  sequenceNumber = (sequenceNumber + 1) % config.connection.MAX_SEQUENCE_NUMBER
  while (callbacks.has(sequenceNumber)) {
    sequenceNumber = (sequenceNumber + 1) % config.connection.MAX_SEQUENCE_NUMBER
  }
  callbacks.set(sequenceNumber, callback)
  return sequenceNumber
}
