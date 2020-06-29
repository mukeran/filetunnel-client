import { sendRequest } from '../index'

export default {
  login: (username, password, publicKey) => sendRequest({ action: 'login', data: { username, password, publicKey } })
}
