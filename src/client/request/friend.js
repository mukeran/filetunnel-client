import { sendRequest } from '../index'

export default {
  requestFriendList: () => sendRequest({ action: 'requestFriendList' }),
  sendFriendRequest: (username) => sendRequest({ action: 'sendFriendRequest', data: { username } }),
  deleteFriend: (userId) => sendRequest({ action: 'deleteFriend', data: { userId } }),
  answerFriendRequest: (_id, operation) => sendRequest({ action: 'answerFriendRequest', data: { _id, operation } })
}
