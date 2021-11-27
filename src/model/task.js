'use strict'

const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')
const { Status, Priority } = require('./enum')

class Task {
  constructor (description, priority, status, list, isArchived, deadline, createTime, updateTime) {
    this.description = description
    this.priority = priority
    this.status = status
    this.deadline = deadline
    this.createTime = createTime
    this.updateTime = updateTime
    this.list = list
    this.isArchived = isArchived
    this._validate()
  }

  setId (id) {
    this.id = id
  }

  _validate () {
    if (this.deadline && !(this.deadline instanceof Date)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'deadline is not a date')
    }
    if (isNaN(this.list)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'list is not integer')
    }
    if ((typeof this.isArchived) !== 'boolean') {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'isArchived is not boolean')
    }
    if (!(this.createTime instanceof Date)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'createTime is not a date')
    }
    if (!(this.updateTime instanceof Date)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'updateTime is not a date')
    }
    if (!Object.values(Status).includes(this.status)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'status value does not exist')
    }
    if (!Object.values(Priority).includes(this.priority)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'priority value does not exist')
    }
  }
}

module.exports = Task
