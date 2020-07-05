import { sendRequest } from '../index'

/**
 * Alive action
 * @returns {Promise | Promise<unknown>}
 */
export default () => sendRequest({ action: 'alive' })
