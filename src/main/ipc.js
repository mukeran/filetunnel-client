/**
 * Register ipc channels
 */
import { ipcMain } from 'electron'
import { connectServer } from '../client'
import request from '../client/request'

const channels = {
  'connectServer': () => connectServer(),
  'login': (event, { username, password }) => request.login(username, password)
}

export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
