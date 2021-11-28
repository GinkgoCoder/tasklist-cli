'use strict'

const { expect } = require('chai')
const TodoException = require('../../src/exception/todo-exception')

exports.validateTodoException = (error, errorCode, message) => {
  expect(error).to.instanceOf(TodoException)
  expect(error.errorCode).to.equal(errorCode)
  expect(error.message).to.equal(message)
}
