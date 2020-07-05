import { sendRequest } from '../index'

export default {
  /**
   * Request offline transfer action
   * @param userId Receivers userId
   * @param filename Filename
   * @param size Size
   * @param sha1 SHA1 sum
   * @param deadline The deadline of receiving
   * @param encryptedKey Key after encryption
   * @param signature Signature of transfer
   * @returns {Promise | Promise<unknown>}
   */
  requestOfflineTransfer: (userId, filename, size, sha1, deadline, encryptedKey, signature) =>
    sendRequest({ action: 'requestOfflineTransfer', data: { userId, filename, size, sha1, deadline, encryptedKey, signature } }),
  /**
   * Query all sent offline transfers action
   * @returns {Promise | Promise<unknown>}
   */
  queryOfflineTransfers: () => sendRequest({ action: 'queryOfflineTransfers' }),
  /**
   * Answer an offline transfer action
   * @param _id ID of offline transfer
   * @param operation accept or deny
   * @returns {Promise | Promise<unknown>}
   */
  answerOfflineTransfer: (_id, operation) => sendRequest({ action: 'answerOfflineTransfer', data: { _id, operation } })
}
