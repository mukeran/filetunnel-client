import { sendRequest } from '../index'

export default {
  login: (username, password, transferPort) => sendRequest({ action: 'login', data: { username, password, transferPort } }),
  register: (username, password, publicKey) => sendRequest({ action: 'register', data: { username, password, publicKey } }),
  logout: () => sendRequest({ action: 'logout' }),
  changePassword: (password, newPassword) => sendRequest({
    action: 'changePassword',
    data: { password, newPassword }
  }),
  changePublicKey: (publicKey) => sendRequest({ action: 'changePublicKey', data: { publicKey } }),
  resumeSession: (sessionId, transferPort) => sendRequest({ action: 'resumeSession', data: { sessionId, transferPort } }),
  requestPublicKey: userId => sendRequest({ action: 'requestPublicKey', data: { userId } }),
  requestTransmit: (targetUid) => sendRequest({ action: 'requestTransmit', data: { _Id: targetUid } })
}
