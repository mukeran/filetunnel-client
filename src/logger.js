/**
 * Configure logger
 */
import { getLogger } from 'log4js'

export const logger = getLogger('Server')
logger.level = 'all'
