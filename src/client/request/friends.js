import { sendRequest } from '../index'

export default {
  requestFriendList: () => sendRequest({ action: 'requestFriendList' }),
  sendFriendRequest: (username) => sendRequest({ action: 'sendFriendRequest', data: { username } }),
  deleteFriend: (userID) => sendRequest({ action: 'deleteFriend', data: { userID } }),
  answerFriendRequest: (_id, operation) => sendRequest({ action: 'answerFriendRequest', data: { _id, operation } }),
  friendTransferRequest: (userID) => sendRequest({ action: 'friendTransferRequest', data: { userID } })
}
