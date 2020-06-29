/**
 * Config file
 */
export default {
  server: {
    HOST: '127.0.0.1',
    PORT: 10088
  },
  connection: {
    MAX_RETRY_TIMES: 3,
    RETRY_PERIOD: 5000,
    MAX_SEQUENCE_NUMBER: 65536,
    RESPONSE_TIMEOUT: 30000
  }
}
