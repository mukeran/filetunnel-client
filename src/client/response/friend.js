import store from '../../renderer/store'
import { sendResponse } from '../index'
import status from '../status'

/**
 * handle FrienddRequests
 * @param {Object} packet Packet recieved
 */
export function sendFriendRequests (packet) {
  const { friendRequests } = packet.data
  store.dispatch('updateFriendRequests', { friendRequests })
  sendResponse({ status: status.OK }, packet)
}
