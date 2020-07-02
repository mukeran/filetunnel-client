import store from '../../renderer/store'
import { sendResponse } from '../index'
import status from '../status'
export function sendFriendRequests (packet) {
  const { requestsData } = packet.data
  console.log(requestsData)
  store.dispatch('updateFriendRequests', { friendRequests: requestsData })
  sendResponse({ status: status.OK }, packet)
}
