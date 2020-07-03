import { sendRequest } from '../index'

export default {
  /**
   * Request friend list
   */
  requestFriendList: () => sendRequest({ action: 'requestFriendList' }),
  /**
   * Send Friend request by username
   */
  sendFriendRequest: (username) => sendRequest({ action: 'sendFriendRequest', data: { username } }),
  /**
   * Delete friend by userId
   */
  deleteFriend: (userId) => sendRequest({ action: 'deleteFriend', data: { userId } }),
  /**
   * Answer friend request by _id and operation
   */
  answerFriendRequest: (_id, operation) => sendRequest({ action: 'answerFriendRequest', data: { _id, operation } })
}
