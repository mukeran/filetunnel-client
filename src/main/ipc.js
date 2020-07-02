/**
 * Register ipc channels
 */
import { ipcMain } from 'electron'
import { connectServer, registerAliveTimeout } from '../client'
import request from '../client/request'
import { logger } from '../logger'
import { send } from '../p2p/client'
import { startServer } from '../p2p/server'
import store from '../renderer/store'
import status from '../client/status'

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
  /**
   * Resume session in case of disconnection
   */
  resumeSession: (event) => {
    request.resumeSession(store.state.user.sessionId)
      .then(packet => {
        if (packet.status !== status.OK) {
          store.dispatch('updateUserInfo', {
            _id: null,
            username: null,
            sessionId: null
          })
        } else {
          event.sender.send('sessionResumed')
        }
      })
  },
  /**
   * Request friend list
   */
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
  sendFriendRequest: (event, { username }) => {
    request.sendFriendRequest(username)
      .then(packet => {
        event.sender.send('friendRequestSent', packet)
      })
  },
  /**
   * Delete friend by userId
   */
  deleteFriend: (event, { userId }) => {
    request.deleteFriend(userId)
      .then(packet => {
        event.sender.send('friendDeleted', packet)
      })
  },
  /**
   * Answer friend request by _id and operation
   */
  answerFriendRequest: (event, {_id, operation}) => {
    request.answerFriendRequest(_id, operation)
      .then(packet => {
        event.sender.send('friendRequestAnswered', packet)
      })
  },
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
