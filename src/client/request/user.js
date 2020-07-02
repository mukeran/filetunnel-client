import { sendRequest } from '../index'

export default {
  login: (username, password) => sendRequest({ action: 'login', data: { username, password } }),
  register: (username, password, publicKey) => sendRequest({ action: 'register', data: { username, password, publicKey } }),
  logout: () => sendRequest({ action: 'logout' }),
  changePassword: (username, password, newPassword) => sendRequest({ action: 'changePassword', data: {username, password, newPassword} })
}
