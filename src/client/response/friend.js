import store from '../../renderer/store'
import { sendResponse } from '../index'
import status from '../status'

/**
 * Handle new friend requests sent from server
 * @param packet Received packet
 */
export function sendFriendRequests (packet) {
  const { friendRequests } = packet.data
  store.dispatch('updateFriendRequests', { friendRequests })
  sendResponse({ status: status.OK }, packet)
}
