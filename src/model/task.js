'use strict'

const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')
const { Status, Priority } = require('./enum')

class Task {
  constructor (description, priority, status, list, deadline, createTime, updateTime) {
    this.description = description
    this.priority = priority
    this.status = status
    this.deadline = deadline
    this.createTime = createTime
    this.updateTime = updateTime
    this.list = list
    this._validate()
  }

  setId (id) {
    this.id = id
  }

  _validate () {
    if (this.deadline && !(this.deadline instanceof Date)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'deadline is not a date')
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
