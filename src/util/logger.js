'use strict'

const winston = require('winston')
const { format } = require('winston')
const { printf } = format

const { HOME_DIR } = require('./constants')

const errorLogger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: HOME_DIR + '/todo.log' })
  ]
})

const infoLogger = winston.createLogger({
  format: printf(({ message }) => `${message}`),
  transports: [
    new winston.transports.Console()
  ]
})

module.exports = {
  info: message => infoLogger.info(message),
  error: message => errorLogger.error(message),
  warn: message => errorLogger.warn(message),
  debug: message => infoLogger.debug(message)
}
