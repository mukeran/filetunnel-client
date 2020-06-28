import { createPackage } from './index'
const logger = require('log4js').getLogger()

export default {
  alive () {
    return new Promise((resolve, reject) => {
      global.client.write(createPackage({
        action: 'alive'
      }), () => {
        logger.log('Send')
      })
    })
  }
}
