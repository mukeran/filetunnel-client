import { sendRequest } from '../index'

export default {
  login: (username, password, transferPort) => sendRequest({ action: 'login', data: { username, password, transferPort } }),
  register: (username, password, publicKey) => sendRequest({ action: 'register', data: { username, password, publicKey } }),
  logout: () => sendRequest({ action: 'logout' }),
  changePassword: (username, password, newPassword) => sendRequest({
    action: 'changePassword',
    data: { username, password, newPassword }
  }),
  resumeSession: (sessionId, transferPort) => sendRequest({ action: 'resumeSession', data: { sessionId, transferPort } }),
  requestPublicKey: userId => sendRequest({ action: 'requestPublicKey', data: { userId } })
}
