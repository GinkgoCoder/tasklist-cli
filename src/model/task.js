'use strict';

const validator = require('validator');
const TodoException = require('../exception/todo-exception');
const ErrorCodes = require('../exception/error-code');
const {Status, Priority} = require("./enum");

class Task {
    constructor(id, description, priority, status, deadline, createTime, updatedTime) {
        this.id = id;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.deadline = deadline;
        this.createTime = createTime;
        this.updatedTime = updatedTime;
        this._validate();
    }

    _validate() {
        if (isNaN(this.id)) {
            throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'id is not a number');
        }
        if (this.deadline && !(this.deadline instanceof Date)) {
            throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'deadline is not a date');
        }
        if (!this.createTime instanceof Date) {
            throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'createTime is not a date');
        }
        if (!(this.updatedTime instanceof Date)) {
            throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'updateTime is not a date');
        }
        if (!Object.values(Status).includes(this.status)) {
            throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'status value does not exist')
        }
        if (!Object.values(Priority).includes(this.priority)) {
            throw new TodoException(ErrorCodes.INVALID_ARGUMENT, 'priority value does not exist')
        }
    }
}

module.exports = Task;

