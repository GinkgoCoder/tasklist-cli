'use strict'

class TodoException extends Error {
  constructor (errorCode, message) {
    super(message)
    this.errorCode = errorCode
  }

  toString () {
    return `ErrorCode: ${this.errorCode}, Message: ${this.message}`
  }
}
module.exports = TodoException
