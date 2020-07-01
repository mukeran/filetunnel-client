/**
 * Register ipc channels
 */
import { ipcMain } from 'electron'
import { connectServer, registerAliveTimeout } from '../client'
import request from '../client/request'
import { logger } from '../logger'

const channels = {
  connectServer: () => connectServer(),
  'login': (event, { username, password }) => {
    request.login(username, password)
      .then((packet) => {
        event.sender.send('loggedIn', packet)
      })
  },
  'register': (event, { username, password, email }) => {
    request.register(username, password, email)
      .then((packet) => {
        event.sender.send('registered', packet)
      })
  },
  'requestFriendList': (event) => {
    logger.fatal('test')
    request.requestFriendList()
    event.sender.send('requestFriendList.done')
  },
  logout: (event) => {
    request.logout()
      .then((packet) => {
        event.sender.send('loggedOut', packet)
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
  registerAliveTimeout: () => registerAliveTimeout()
}

export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
