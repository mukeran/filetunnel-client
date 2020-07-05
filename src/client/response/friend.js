import store from '../../renderer/store'
import { sendResponse } from '../index'
import status from '../status'

/**
 * Process friend requests
 * @param {Object} packet Packet received
 */
export function sendFriendRequests (packet) {
  const { friendRequests } = packet.data
  store.dispatch('updateFriendRequests', { friendRequests })
  sendResponse({ status: status.OK }, packet)
}
