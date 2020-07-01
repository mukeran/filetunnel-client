/**
 * Register ipc channels
 */
import { ipcMain } from 'electron'
import { connectServer, registerAliveTimeout } from '../client'
import request from '../client/request'

const channels = {
  connectServer: () => connectServer(),
  login: (event, { username, password }) => {
    request.login(username, password)
      .then((packet) => {
        event.sender.send('loggedIn', packet)
      })
  },
  register: (event, { username, password, email }) => {
    request.register(username, password, email)
      .then((packet) => {
        event.sender.send('registered', packet)
      })
  },
  requestFriendList: (event) => {
    request.requestFriendList()
    event.sender.send('friendListRequested')
  },
  calculateHash: (event, { filePath }) => {
    const fs = require('fs')
    const crypto = require('crypto')
    const stream = fs.createReadStream(filePath)
    const hash = crypto.createHash('sha1')
    stream.on('data', (data) => hash.update(data))
    stream.on('error', () => {
      event.sender.send('hashCalculated', { filePath, sha1: 'SHA1计算出错' })
    })
    stream.on('end', () => {
      event.sender.send('hashCalculated', { filePath, sha1: hash.digest('hex') })
    })
  },
  registerAliveTimeout: () => registerAliveTimeout(),
  generateKeyPair: (event) => {
    const NodeRSA = require('node-rsa')
    const key = new NodeRSA({ b: 2048 })
    const publicKey = key.exportKey('pkcs1-public-pem')
    const privateKey = key.exportKey('pkcs1-private-pem')
    event.sender.send('keyPairGenerated', { publicKey, privateKey })
  }
}

export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
