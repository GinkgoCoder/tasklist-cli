
'use strict'

const ListService = require('../service/list-service')
const Render = require('../util/render')
const _ = require('lodash')
const TaskService = require('../service/task-service')
const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')
const validator = require('validator')
const { Priority } = require('../model/enum')

class TaskCommand {
  constructor (dbpath, logger) {
    this.listService = new ListService(dbpath)
    this.taskService = new TaskService(dbpath)
    this.logger = logger
    this.render = new Render(logger)
  }

  async _createTask (opts) {
    const lists = await this.listService.getLists()

    if (lists.length === 0) {
      this.logger.error((new TodoException(ErrorCodes.NO_DEFAULT_LIST, 'There is no list')).toString())
      this.render.outputErrorMessage('There is no list, please create a list first')
      return
    }

    try {
      if (opts.list) {
        await this.taskService.createTask(opts.create, opts.list)
      } else {
        await this.taskService.createTask(opts.create, lists[0].name)
      }
      this.render.outputSuccessMessage('Successfully create the task')
    } catch (e) {
      this.logger.error(e.toString())
      this.render.outputErrorMessage(`Failed to create the task ${opts.create}`)
    }
  }

  async _deleteTasks (opts) {
    const ids = _.isArray(opts.delete) ? opts.delete : [opts.delete]

    if (!ids.every(id => validator.isInt(id))) {
      this.render.outputErrorMessage(`The task id should be integer`)
      return
    }

    const [successIds, failIds] = [[], []]
    for (const id of ids) {
      try {
        await this.taskService.deleteTaskById(parseInt(id))
        successIds.push(id)
      } catch (e) {
        this.logger.error(e.toString())
        failIds.push(id)
      }
    }
    if (successIds.length > 0) {
      this.render.outputSuccessMessage(`Successfully delete tasks ${successIds}`)
    }
    if (failIds.length > 0) {
      this.render.outputErrorMessage(`Failed to delete tasks ${failIds}`)
    }
  }

  async _updateTask (opts) {
    opts.update = _.isArray(opts.update) ? opts.update : [opts.update]
    if (opts.update.length < 2) {
      this.render.outputErrorMessage(`Please provide the task id and the new description, e.g td task -u 1 new`)
      return
    }

    if (!validator.isInt(opts.update[0])) {
      this.render.outputErrorMessage(`The task id should be integer`)
      return
    }

    try {
      await this.taskService.updateTaskDescription(parseInt(opts.update[0]), opts.update[1])
      this.render.outputSuccessMessage(`Successfully update the task ${opts.update[0]}`)
    } catch (e) {
      this.logger.error(e.toString())
      this.render.outputErrorMessage(`Failed to update the task ${opts.update[0]}`)
    }
  }

  async _moveTask (opts) {
    if (!opts.list) {
      this.render.outputErrorMessage(`Please specify the target list e.g: td task -m 1 -l list`)
      return
    }

    if (!validator.isInt(opts.move)) {
      this.render.outputErrorMessage(`The task ID should be integer`)
      return
    }

    try {
      await this.taskService.updateTaskList(parseInt(opts.move), opts.list)
      this.render.outputSuccessMessage(`Successfully move the task ${opts.move} to list ${opts.list}`)
    } catch (e) {
      this.logger.error(e.toString())
      this.render.outputErrorMessage(`Failed to move the task ${opts.move}`)
    }
  }

  async _setTaskPriority (opts) {
    opts.priority = _.isArray(opts.priority) ? opts.priority : [opts.priority]

    if (opts.priority.length !== 2) {
      this.render.outputErrorMessage(`Please specify the task and priority correctly. e.g td t -p 1 high`)
      return
    }

    if (!validator.isInt(opts.priority[0])) {
      this.render.outputErrorMessage('Task id should be an integer')
      return
    }

    if (!Object.values(Priority).includes(opts.priority[1])) {
      this.render.outputErrorMessage(`Priority is not supported, only support high, medium, low and none`)
      return
    }

    try {
      await this.taskService.updateTaskPriority(parseInt(opts.priority[0]), opts.priority[1])
      this.render.outputSuccessMessage(`Successfully update the task ${opts.priority[0]} priority`)
    } catch (e) {
      this.logger.error(e.toString())
      this.render.outputErrorMessage(`Failed to update the task ${opts.priority[0]} priority`)
    }
  }

  async handle (opts) {
    if (opts.create) {
      await this._createTask(opts)
    } else if (opts.update) {
      await this._updateTask(opts)
    } else if (opts.delete) {
      await this._deleteTasks(opts)
    } else if (opts.move) {
      await this._moveTask(opts)
    } else if (opts.priority) {
      await this._setTaskPriority(opts)
    }
  }
}

module.exports = TaskCommand
