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
    REJECTED: 3,
    TRANSFERRING: 4,
    FINISHED: 5,
    CANCELLED: 6,
    PAUSED: 7,
    WAITING: 8,
    FAILED: 9
  },
  connection: {
    CONNECTED: 0,
    CONNECTING: 1,
    DISCONNECTED: 2
  }
}
