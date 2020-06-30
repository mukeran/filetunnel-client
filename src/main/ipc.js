/**
 * Register ipc channels
 */
import { ipcMain } from 'electron'
import { connectServer } from '../client'
import request from '../client/request'
import { logger } from '../logger'

const channels = {
  'connectServer': () => connectServer(),
  'login': (event, { username, password }) => request.login(username, password),
  'register': (event, { username, password, email }) => {
    request.register(username, password, email)
      .then((packet) => {
        event.sender.send('register-done', packet)
      })
  },
  'requestFriendList': (event) => {
    logger.fatal('test')
    request.requestFriendList()
    event.sender.send('requestFriendList.done')
  }
}

export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
