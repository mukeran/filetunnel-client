import store from '../../renderer/store'
import { sendResponse } from '../index'
import status from '../status'

/**
 * Process offline transfer requests
 * @param {Oblect} packet Packet received
 */
export function sendOfflineTransfers (packet) {
  const { offlineTransfers } = packet.data
  store.dispatch('updateOfflineTransfers', { offlineTransfers })
  sendResponse({ status: status.OK }, packet)
}
