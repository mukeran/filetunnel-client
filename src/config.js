/**
 * Config file
 */
export default {
  server: {
    HOST: '127.0.0.1',
    PORT: 10088
  },
  connection: {
    ALIVE_PERIOD: 10000,
    MAX_RETRY_TIMES: 3,
    MAX_SEQUENCE_NUMBER: 65536,
    RESPONSE_TIMEOUT: 30000
  }
}
