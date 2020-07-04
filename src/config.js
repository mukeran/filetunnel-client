/**
 * Config file
 */
export default {
  server: {
    HOST: '127.0.0.1',
    PORT: 10088,
    TRANSFER_PORT: 10089
  },
  connection: {
    ALIVE_PERIOD: 10000,
    MAX_RETRY_TIMES: 3,
    MAX_SEQUENCE_NUMBER: 65536,
    RESPONSE_TIMEOUT: 30000
  },
  transfer: {
    CIPHER_ALGORITHM: 'AES-256-CBC'
  }
}
