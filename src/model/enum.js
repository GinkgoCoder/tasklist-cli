'use strict'

const ErrorCodes = require('../exception/error-code')
const TodoException = require('../exception/todo-exception')

exports.Priority = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

exports.Status = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  BLOCK: 'block',
  COMPLETE: 'complete'
}

exports.validatePriority = (priority) => {
  if (!Object.values(this.Priority).includes(priority)) {
    throw new TodoException(ErrorCodes.INVALID_ARGUMENT,
      `Priority ${priority} not supported, only support high, medium, low and none`)
  }
}
