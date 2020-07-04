import store from '../../renderer/store'
import { sendResponse } from '../index'
import status from '../status'

export function sendOfflineTransfers (packet) {
  const { offlineTransfers } = packet.data
  store.dispatch('updateOfflineTransfers', { offlineTransfers })
  sendResponse({ status: status.OK }, packet)
}
