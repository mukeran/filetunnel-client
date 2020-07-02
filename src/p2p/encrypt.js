import { logger } from '../logger'

/**
 * encrypt related functions
 */
const { createHash, scrypt, generateKeyPair, createCipheriv, createDecipheriv, publicEncrypt, privateEncrypt, privateDecrypt, publicDecrypt, randomBytes } = require('crypto')
const { promisify } = require('util')
const { createGzip, createUnzip } = require('zlib')
const { createWriteStream, createReadStream } = require('fs')
const { IVInserter } = require('./streams')
const path = require('path')

export const cipherAlgorithm = 'AES-256-CBC'
let salt = Buffer.from('838645f4bbc979bd349287f2ad3559be', 'hex')

/**
 * createKeyPair().then( ({publicKey, privateKey}) => {} )
 * @returns {Promise}
 */
export function createKeyPair () {
  return promisify(generateKeyPair)('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    }
  })
}

export function randomAESKey () {
  return randomBytes(32)
}

export function generateAESKey (passwd) {
  return promisify(scrypt)(passwd, salt, 32)
}

export function randomNonce () {
  return randomBytes(5).toString('hex')
}

/**
 * sign a message with private key
 * @param {String} message message to sign
 * @param {String} privateKey user's private key
 * @returns {String} encryptedHash base64 encoded
 */
export function signString (message, privateKey) {
  let hash = createHash('sha1')
  hash.update(message)
  let encrypted = privateEncrypt(privateKey, hash.digest())
  return encrypted.toString('base64')
}

/**
 * verify a message with public key
 * @param {String} message message to verify
 * @param {String} publicKey sender's public key
 * @returns {boolean} verified
 */
export function verifyString (message, sign, publicKey) {
  let buffer = Buffer.from(sign, 'base64')
  let encrypted = publicDecrypt(publicKey, buffer)
  let hash = createHash('sha1')
  hash.update(message)
  return hash.digest().equals(encrypted)
}

export function encryptKey (key, publicKey) {
  logger.debug()
  return publicEncrypt(publicKey, key).toString('base64')
}

export function decryptKey (enc, privateKey) {
  return privateDecrypt(privateKey, Buffer.from(enc, 'base64'))
}

export function encryptFile (key, pat) {
  return new Promise((resolve, reject) => {
    let readStream = createReadStream(pat)
    readStream.on('error', (err) => { reject(err) })
    let writeStream = createWriteStream(path.join(pat + '.enc'))
    writeStream.on('error', (err) => { reject(err) })
    let gzip = createGzip()
    let iv = randomBytes(16)
    let cipher = createCipheriv(cipherAlgorithm, key, iv)
    let ivs = IVInserter(iv)
    readStream.pipe(gzip)
      .pipe(cipher)
      .pipe(ivs)
      .pipe(writeStream)
    writeStream.on('finish', () => {
      resolve()
    })
  })
}

export async function decryptFile (key, path, dpath) {
  let p = { iv: Buffer.alloc(0) }
  await new Promise((resolve, reject) => {
    const stream = createReadStream(path, { end: 15 })
    stream.on('data', (data) => {
      p.iv = Buffer.concat([p.iv, data])
    })
    stream.on('close', () => { resolve() })
    stream.on('error', (err) => { reject(err) })
  })
  console.log(p.iv)
  let readStream = createReadStream(path, { start: 16 })
  readStream.on('error', (err) => { throw err })
  let writeStream = createWriteStream(dpath)
  writeStream.on('error', (err) => { throw err })
  let decipher = createDecipheriv(cipherAlgorithm, key, p.iv)
  let unzip = createUnzip()
  readStream.pipe(decipher)
    .pipe(unzip)
    .pipe(writeStream)
  await new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      resolve()
    })
  })
}

export function encryptString (key, str) {
  let iv = randomBytes(16)
  let cipher = createCipheriv(cipherAlgorithm, key, iv)
  let encrypted = Buffer.concat([iv, cipher.update(str), cipher.final()])
  return encrypted.toString('base64')
}

export function decryptString (key, str) {
  let encrypted = Buffer.from(str, 'base64')
  let decipher = createDecipheriv(cipherAlgorithm, key, encrypted.slice(0, 16))
  encrypted = encrypted.slice(16)
  let dec = decipher.update(encrypted)
  dec += decipher.final()
  return dec.toString()
}

// module.exports = { randomAESKey, randomNonce, decryptString, encryptString, cipherAlgorithm, signString, encryptKey, decryptKey, verifyString, createKeyPair }
