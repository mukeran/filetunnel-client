import { sendRequest } from '../index'

export default {
  requestFriendList: () => sendRequest({ action: 'requestFriendList' }),
  sendFriendRequest: (userID) => sendRequest({ action: 'sendFriendRequest', data: { userID } }),
  deleteFriend: (userID) => sendRequest({ action: 'deleteFriend', data: { userID } }),
  answerFriendRequest: (friendRequestID, operation) => sendRequest({ action: 'answerFriendRequest', data: { friendRequestID, operation } })
}
