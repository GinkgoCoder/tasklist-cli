'use strict'

const Task = require('../../src/model/task')
const { Priority, Status } = require('../../src/model/enum')
const TodoException = require('../../src/exception/todo-exception')
const { expect } = require('chai')

/* eslint-disable no-new */
describe('Task Model Test', function () {
  it('should create task successfully', () => {
    new Task('', Priority.HIGH, Status.PENDING, 'list',
      new Date(), new Date(), new Date())
  })

  it('should throw InvalidArgument Error if date argument is invalid', () => {
    expect(function () {
      new Task('', Priority.HIGH, Status.PENDING, 'list',
        new Date(), new Date(), '')
    }).to.throw(TodoException, 'updateTime is not a date')
  })

  it('should throw InvalidArgument Error if enum argument is invalid', () => {
    expect(function () {
      new Task('', '', Status.PENDING, 'list',
        new Date(), new Date(), new Date())
    }).to.throw(TodoException, 'priority value does not exist')
  })
})
