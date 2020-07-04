import { sendRequest } from '../index'

export default {
  requestOfflineTransfer: (userId, filename, size, sha1, deadline, encryptedKey, signature) =>
    sendRequest({ action: 'requestOfflineTransfer', data: { userId, filename, size, sha1, deadline, encryptedKey, signature } }),
  queryOfflineTransfers: () => sendRequest({ action: 'queryOfflineTransfers' }),
  answerOfflineTransfer: (_id, operation) => sendRequest({ action: 'answerOfflineTransfer', data: { _id, operation } })
}
