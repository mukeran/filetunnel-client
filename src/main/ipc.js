/**
 * Register ipc channels
 */
import { ipcMain } from 'electron'
import { connectServer, registerAliveTimeout } from '../client'
import request from '../client/request'

const channels = {
  connectServer: () => connectServer(),
  'login': (event, { username, password }) => request.login(username, password),
  'register': (event, { username, password, email }) => {
    request.register(username, password, email)
      .then((packet) => {
        event.sender.send('registered', packet)
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
  // 'sendFriendRequests': () => request.sendFriendRequests()
}

export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
