import { sendRequest } from '../index'

export default {
  /**
   * Login action
   * @param username Username
   * @param password Password
   * @param transferPort Transfer port of P2P server
   * @returns {Promise | Promise<unknown>}
   */
  login: (username, password, transferPort) => sendRequest({ action: 'login', data: { username, password, transferPort } }),
  /**
   * Register action
   * @param username Username
   * @param password Password
   * @param publicKey Public key generated when registering
   * @returns {Promise | Promise<unknown>}
   */
  register: (username, password, publicKey) => sendRequest({ action: 'register', data: { username, password, publicKey } }),
  /**
   * Logout action
   * @returns {Promise | Promise<unknown>}
   */
  logout: () => sendRequest({ action: 'logout' }),
  /**
   * Change password action
   * @param password Old password
   * @param newPassword New password
   * @returns {Promise | Promise<unknown>}
   */
  changePassword: (password, newPassword) => sendRequest({
    action: 'changePassword',
    data: { password, newPassword }
  }),
  /**
   * Change public key action
   * @param publicKey Public key to change
   * @returns {Promise | Promise<unknown>}
   */
  changePublicKey: (publicKey) => sendRequest({ action: 'changePublicKey', data: { publicKey } }),
  /**
   * Resume session action (to resume session when long TPC connection is disconnected)
   * @param sessionId SessionID of a session
   * @param transferPort Transfer port of P2P server
   * @returns {Promise | Promise<unknown>}
   */
  resumeSession: (sessionId, transferPort) => sendRequest({ action: 'resumeSession', data: { sessionId, transferPort } }),
  /**
   * Request public key action (request friends public key)
   * @param userId UserId to query
   * @returns {Promise | Promise<unknown>}
   */
  requestPublicKey: userId => sendRequest({ action: 'requestPublicKey', data: { userId } }),
  /**
   * Request server tunnel transmit action
   * @param targetUid Receiver's userId
   * @returns {Promise | Promise<unknown>}
   */
  requestTransmit: (targetUid) => sendRequest({ action: 'requestTransmit', data: { _id: targetUid } }),
  /**
   * Update transfer port action when P2P server is up
   * @param port Transfer port
   * @returns {Promise | Promise<unknown>}
   */
  updateTransferPort: port => sendRequest({ action: 'updateTransferPort', data: { port } })
}
