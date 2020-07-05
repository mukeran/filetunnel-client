'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import { registerIpc } from './ipc'
import { client } from '../client'
import { server, startServer } from '../p2p/server'

/**
 * Main entry of the application
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

export let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 1000,
    minWidth: 1000,
    minHeight: 300,
    autoHideMenuBar: true
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  /* Create main window and start P2P server */
  createWindow()
  startServer()
  /* Hide application menu */
  Menu.setApplicationMenu(Menu.buildFromTemplate([]))
})

app.on('window-all-closed', async () => {
  /* Close connection to server when window closed */
  if (client !== null) {
    await client.end()
  }
  /* Close P2P server when window closed */
  if (server !== null) {
    await server.close()
  }
  /* Quit application when not on macOS */
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/* Register all IPC actions */
registerIpc()

/* Log all unhandled exception */
process.on('unhandledRejection', function (promise, reason) {
  console.log(promise)
  console.log(reason)
}).on('uncaughtException', function (promise, reason) {
  console.log(promise)
  console.log(reason)
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
