'use strict'

const TodoException = require('./exception/todo-exception')
const ListService = require('./service/list-service')
const TaskService = require('./service/task-service')
const { error } = require('./util/logger')
const _ = require('lodash')

class Opration {
  constructor (dbPath, render) {
    this.taskService = new TaskService(dbPath)
    this.listService = new ListService(dbPath)
    this.render = render
  }

  async taskOperation (opts) {
    if (opts.create) {
      if (!opts.list) {
        await this.taskService.createTask(opts.create)
      } else {
        await this.taskService.createTask(opts.create, opts.list)
      }
    } else if (opts.delete) {
      opts.delete = _.isArray(opts.delete) ? opts.delete : [opts.delete]
      for (const id of opts.delete) {
        await this.taskService.deleteTasks(id)
      }
    } else if (opts.update) {
      opts.update = _.isArray(opts.update) ? opts.update : [opts.update]
      if (opts.update.length < 2) {
        this.render.outputErrorMessage('Please provide task id and new task description. eg: 1 "new task"')
        throw new TodoException('')
      }
    }
  }

  async showTasks (opts) {
    const lists = await this.listService.getLists()

    if (opts.list) {
      const filteredList = lists.filter(l => l.name === opts.list)
      if (filteredList.length > 0) {
        await this._showTaskForList(filteredList)
      }
    } else {
      for (const list of lists) {
        await this._showTaskForList(list)
      }
    }
  }

  async _showTaskForList (list) {
    const tasksForList = await this.taskService.getTasksByListId(list.id)
    this.render.renderList(list.name, tasksForList)
  }
}

module.exports = Opration
