import status from '../client/status'
import { logger } from '../logger'
import request from '../client/request'

/**
 * key access
 */
const store = require('../renderer/store').default
const { readFile } = require('fs')
const { promisify } = require('util')

/**
 * read private key file. (generally pem format)
 * @param {String} path private key file path
 */
function getPrivateKeyAt (path) {
  return promisify(readFile)(path)
}

/**
 * read private key from the privateKeyPath from vuex store
 */
export function getPrivateKey () {
  return getPrivateKeyAt(store.state.system.privateKeyPath)
}

/**
 * get public key from server
 * @param {String} uid
 */
export function getPublicKey (uid) {
  return new Promise((resolve, reject) => {
    request.requestPublicKey(uid).then(packet => {
      if (packet.status !== status.OK) {
        logger.error(`get ${uid} public key failed: ${JSON.stringify(packet)}`)
      }
      resolve(packet.data.publicKey)
    })
  })
}

// module.exports = {}
