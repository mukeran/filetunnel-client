import { sendRequest } from '../index'

export default {
  login: (username, password) => sendRequest({ action: 'login', data: { username, password } })
}
