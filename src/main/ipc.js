/**
 * Register ipc channels
 * Used for the communication between the main process and the renderer process
 * 用于主进程和渲染进程之间的通讯
 */
import { ipcMain } from 'electron'
import { connectServer, registerAliveTimeout } from '../client'
import request from '../client/request'
import { logger } from '../logger'
import { send } from '../p2p/client'
import { startServer, stopServer } from '../p2p/server'
import store from '../renderer/store'
import status from '../client/status'
import { requestOfflineTransfer } from '../offline/sender'
import { acceptOfflineTransfer, validateSignature } from '../offline/receiver'
import { connect } from '../p2p/transmit'
import { createConnection } from 'net'
import config from '../config'
import { mainWindow } from '.'

const channels = {
  /* Connect server */
  connectServer: () => connectServer(),
  login: (event, { username, password, transferPort }) => {
    request.login(username, password, transferPort)
      .then((packet) => {
        event.sender.send('loggedIn', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Server tunnel transmit request */
  requestTransmit: (event, {targetUid, deadline, filePath, size, sha1}) => {
    request.requestTransmit(targetUid)
      .then((packet) => {
        event.sender.send('Transmit approved', packet)
        const transmitId = packet.data._id
        let socket = createConnection(config.server.TRANSFER_PORT, config.server.HOST)
        socket.on('error', (err) => {
          logger.debug('transmit connection started')
          mainWindow.webContents.send('message', { title: '中转请求失败', type: 'error' })
          logger.error(err)
        })
        socket.on('close', (err) => {
          logger.debug('transmit connection closed')
          logger.error(err)
        })
        if (transmitId === '') {
          logger.error('Transmit request without login')
        }
        socket.fileInfo = { deadline, filePath, size, sha1 }
        logger.debug('start transmit connection')
        connect(socket, transmitId, targetUid)
      }).catch(err => { logger.error(err) })
  },
  /* Register */
  register: (event, { username, password, publicKey }) => {
    request.register(username, password, publicKey)
      .then((packet) => {
        event.sender.send('registered', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Change password */
  changePassword: (event, { password, newPassword }) => {
    request.changePassword(password, newPassword)
      .then((packet) => {
        event.sender.send('passwordChanged', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Change public key */
  changePublicKey: (event, {publicKey}) => {
    request.changePublicKey(publicKey)
      .then((packet) => {
        event.sender.send('publicKeyChanged', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Logout */
  logout: (event) => {
    request.logout()
      .then((packet) => {
        event.sender.send('loggedOut', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Resume session */
  resumeSession: (event) => {
    request.resumeSession(store.state.user.sessionId, store.state.system.transferPort)
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
      }).catch(err => { logger.error(err) })
  },
  /* Request friend list */
  requestFriendList: (event) => {
    request.requestFriendList()
      .then((packet) => {
        event.sender.send('friendListRequested', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Calculate SHA1 for a file */
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
  /* Register sending alive packet */
  registerAliveTimeout: () => registerAliveTimeout(true),
  /* Send friend request */
  sendFriendRequest: (event, { username }) => {
    request.sendFriendRequest(username)
      .then(packet => {
        event.sender.send('friendRequestSent', packet)
      }).catch(err => { logger.error(err) })
  },
  /* delete a friend */
  deleteFriend: (event, { userId }) => {
    request.deleteFriend(userId)
      .then(packet => {
        event.sender.send('friendDeleted', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Answer a friend request */
  answerFriendRequest: (event, {_id, operation}) => {
    request.answerFriendRequest(_id, operation)
      .then(packet => {
        event.sender.send('friendRequestAnswered', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Generate RSA key pair using node-rsa library */
  generateKeyPair: (event) => {
    const NodeRSA = require('node-rsa')
    const key = new NodeRSA({ b: 2048 })
    const publicKey = key.exportKey('pkcs1-public-pem')
    const privateKey = key.exportKey('pkcs1-private-pem')
    event.sender.send('keyPairGenerated', { publicKey, privateKey })
  },
  /* Stop P2P transfer server */
  stopTransferServer: () => { stopServer() },
  /* Start P2P transfer server */
  startTransferServer: () => { startServer() },
  /* Send file by P2P */
  sendFile: (event, { ip, port, myUid, targetUid, deadline, filePath, size, sha1 }) => {
    send(ip, port, myUid, targetUid, deadline, filePath, size, sha1).catch(err => {
      logger.error(err)
    })
  },
  /* Request offline transfer */
  requestOfflineTransfer: (event, { userId, path, size, sha1, deadline, toUsername }) => {
    requestOfflineTransfer(userId, path, size, sha1, deadline, toUsername)
      .then(_id => {
        event.sender.send('offlineTransferRequested', { _id })
      })
      .catch(err => {
        logger.error(err)
      })
  },
  /* Query offline transfers */
  queryOfflineTransfers: (event) => {
    request.queryOfflineTransfers()
      .then(packet => {
        event.sender.send('offlineTransfersQueried', packet)
      }).catch(err => { logger.error(err) })
  },
  /* Answer offline transfer */
  answerOfflineTransfer: (event, { _id, operation, fromUserId, filename, filePath, size, sha1, encryptedKey, fromUsername }) => {
    if (operation === 'accept') {
      acceptOfflineTransfer(_id, fromUserId, filename, filePath, size, sha1, encryptedKey, fromUsername)
        .then(() => {
          event.sender.send('offlineTransferAnswered')
        })
        .catch(err => {
          logger.error(err)
          event.sender.send('offlineTransferAnswered', err)
        })
    } else {
      request.answerOfflineTransfer(_id, operation)
        .then(packet => {
          event.sender.send('offlineTransferAnswered', packet)
        }).catch(err => { logger.error(err) })
    }
  },
  /* Validate signature for offline transfer */
  validateSignature: (event, { fromUserId, filename, size, sha1, deadline, encryptedKey, signature }) => {
    validateSignature(fromUserId, filename, size, sha1, deadline, encryptedKey, signature)
      .then(result => {
        event.sender.send('signatureValidated', result)
      })
      .catch(err => {
        logger.error(err)
        event.sender.send('signatureValidated', false)
      })
  }
}

/**
 * Register all above IPC
 */
export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
