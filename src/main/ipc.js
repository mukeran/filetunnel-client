/**
 * Register ipc channels
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
import { acceptOfflineTransfer } from '../offline/receiver'
import { connect } from '../p2p/transmit'
import { createConnection } from 'net'
import config from '../config'

const channels = {
  connectServer: () => connectServer(),
  login: (event, { username, password, transferPort }) => {
    request.login(username, password, transferPort)
      .then((packet) => {
        event.sender.send('loggedIn', packet)
      })
  },
  /* 中转传输请求 */
  requestTransmit: (event, {targetUid, deadline, filePath, size, sha1}) => {
    request.requestTransmit(targetUid)
      .then((packet) => {
        event.sender.send('Transmit approved', packet)
        const transmitId = packet.data._id
        let socket = createConnection(config.server.DATA_PORT, config.server.HOST)
        socket.on('error', (err) => {
          logger.debug('transmit connection started')
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
      })
  },
  register: (event, { username, password, publicKey }) => {
    request.register(username, password, publicKey)
      .then((packet) => {
        event.sender.send('registered', packet)
      })
  },
  changePassword: (event, { password, newPassword }) => {
    request.changePassword(password, newPassword)
      .then((packet) => {
        event.sender.send('passwordChanged', packet)
      })
  },
  changePublicKey: (event, {publicKey}) => {
    request.changePublicKey(publicKey)
      .then((packet) => {
        event.sender.send('publicKeyChanged', packet)
      })
  },
  logout: (event) => {
    request.logout()
      .then((packet) => {
        event.sender.send('loggedOut', packet)
      })
  },
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
  registerAliveTimeout: () => registerAliveTimeout(true),
  sendFriendRequest: (event, { username }) => {
    request.sendFriendRequest(username)
      .then(packet => {
        event.sender.send('friendRequestSent', packet)
      })
  },
  deleteFriend: (event, { userId }) => {
    request.deleteFriend(userId)
      .then(packet => {
        event.sender.send('friendDeleted', packet)
      })
  },
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
  stopTransferServer: () => { stopServer() },
  startTransferServer: () => { startServer() },
  sendFile: (event, { ip, port, myUid, targetUid, deadline, filePath, size, sha1 }) => {
    send(ip, port, myUid, targetUid, deadline, filePath, size, sha1).catch(err => {
      logger.error(err)
    })
  },
  requestOfflineTransfer: (event, { userId, path, size, sha1, deadline }) => {
    requestOfflineTransfer(userId, path, size, sha1, deadline)
      .then(_id => {
        event.sender.send('offlineTransferRequested', { _id })
      })
      .catch(err => {
        logger.error(err)
      })
  },
  queryOfflineTransfers: (event) => {
    request.queryOfflineTransfers()
      .then(packet => {
        event.sender.send('offlineTransfersQueried', packet)
      })
  },
  answerOfflineTransfer: (event, { _id, operation, fromUserId, filename, filePath, size, sha1, encryptedKey }) => {
    if (operation === 'accept') {
      acceptOfflineTransfer(_id, fromUserId, filename, filePath, size, sha1, encryptedKey)
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
        })
    }
  }
}

export function registerIpc () {
  for (let key in channels) {
    ipcMain.on(key, channels[key])
  }
}
