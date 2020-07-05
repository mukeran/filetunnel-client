import { sendRequest } from '../index'

export default {
  /**
   * Request friend list action
   * @returns {Promise | Promise<unknown>}
   */
  requestFriendList: () => sendRequest({ action: 'requestFriendList' }),
  /**
   * Send friend request action
   * @param username User's username to add
   * @returns {Promise | Promise<unknown>}
   */
  sendFriendRequest: (username) => sendRequest({ action: 'sendFriendRequest', data: { username } }),
  /**
   * Delete friend action
   * @param userId Friend's userId to delete
   * @returns {Promise | Promise<unknown>}
   */
  deleteFriend: (userId) => sendRequest({ action: 'deleteFriend', data: { userId } }),
  /**
   * Answer friend request action
   * @param _id FriendRequestID to answer
   * @param operation accept or deny
   * @returns {Promise | Promise<unknown>}
   */
  answerFriendRequest: (_id, operation) => sendRequest({ action: 'answerFriendRequest', data: { _id, operation } })
}
