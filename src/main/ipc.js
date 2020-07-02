/**
 * Register ipc channels
 */
import { ipcMain } from 'electron'
import { connectServer, registerAliveTimeout } from '../client'
import request from '../client/request'
import { logger } from '../logger'
import { send } from '../p2p/client'
import { startServer } from '../p2p/server'

const channels = {
  connectServer: () => connectServer(),
  login: (event, { username, password }) => {
    request.login(username, password)
      .then((packet) => {
        event.sender.send('loggedIn', packet)
      })
  },
  register: (event, { username, password, publicKey }) => {
    request.register(username, password, publicKey)
      .then((packet) => {
        event.sender.send('registered', packet)
      })
  },
  changePassword: (event, { username, password, newPassword }) => {
    request.changePassword(username, password, newPassword)
      .then((packet) => {
        event.sender.send('passwordChanged', packet)
      })
  },
  logout: (event) => {
    request.logout()
      .then((packet) => {
        event.sender.send('loggedOut', packet)
      })
  },
  requestFriendList: (event) => {
    request.requestFriendList()
      .then((packet) => {
        event.sender.send('friendListRequested', packet)
      })
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
  sendFriendRequest: (event, {username}) => {
    request.sendFriendRequest(username)
      .then((packet) => {
        event.sender.send('requestSended')
      })
  },

  deleteFriend: (event, {userID}) => {
    request.deleteFriend(userID)
      .then((packet) => {
        event.sender.send('deleteFinished', packet)
      })
  },
  answerFriendRequest: (event, {_id, operation}) => {
    request.answerFriendRequest(_id, operation)
      .then((packet) => {
        event.sender.send('requestAnswered')
      })
  },
  'friendTransferRequest': (event, { userID }) => request.friendTransferRequest(userID)
  generateKeyPair: (event) => {
    const NodeRSA = require('node-rsa')
    const key = new NodeRSA({ b: 2048 })
    const publicKey = key.exportKey('pkcs1-public-pem')
    const privateKey = key.exportKey('pkcs1-private-pem')
    event.sender.send('keyPairGenerated', { publicKey, privateKey })
  },
  startTransferServer: () => { startServer().catch((err) => { logger.error(err) }) },
  sendFile: (event, { ip, port, myUid, targetUid, deadline, filePath, size, sha1 }) => {
    send(ip, port, myUid, targetUid, deadline, filePath, size, sha1).catch(err => {
      logger.error(err)
    })
  }
}

export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
