'use strict'

const { await } = require('signale')
const ListService = require('./service/list-service')
const TaskService = require('./service/task-service')
const { renderList } = require('./util/render')

class Opration {
  constructor (dbPath) {
    this.taskService = new TaskService(dbPath)
    this.listService = new ListService(dbPath)
  }

  async taskOperation (opts) {
    if (opts.create) {
      if (!opts.list) {
        await this.taskService.createTask(opts.create)
      } else {
        await this.taskService.createTask(opts.create, opts.list)
      }
    }
  }

  async showTasks (opts) {
    const lists = await this.listService.getLists()

    for (const list of lists) {
      const tasksForList = await this.taskService.getTasksByListId(list.id)
      renderList(list.name, tasksForList)
    }
  }
}

module.exports = Opration
