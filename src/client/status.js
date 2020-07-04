/**
 * All response status
 */
export default {
  OK: 0,
  UNKNOWN_ERROR: -1,
  ACCESS_DENIED: -2,
  session: {
    NO_SUCH_SESSION: 1
  },
  user: {
    DUPLICATED_USERNAME: 1,
    WRONG_USERNAME_OR_PASSWORD: 2,
    NO_SUCH_USER: 3
  },
  transfer: {
    REQUEST: 1,
    CONNECTING: 2,
    PENDING: 3,
    REJECTED: 4,
    TRANSFERRING: 5,
    FINISHED: 6,
    CANCELLED: 7,
    PAUSED: 8,
    WAITING: 9,
    FAILED: 10
  },
  connection: {
    CONNECTED: 0,
    CONNECTING: 1,
    DISCONNECTED: 2
  },
  offlineTransfer: {
    UPLOADING: 0,
    PENDING: 1,
    ACCEPTED: 2,
    REJECTED: 3,
    INVALID_SIGN: 4
  }
}
