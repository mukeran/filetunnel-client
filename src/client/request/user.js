import { sendRequest } from '../index'

export default {
  login: (username, password) => sendRequest({ action: 'login', data: { username, password } }),
  logout: () => sendRequest({ action: 'logout' }),
  register: (username, password, email) => sendRequest({ action: 'register', data: { username, password, email } })
}
