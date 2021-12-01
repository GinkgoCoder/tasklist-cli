'use strict'

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
    renderList(list.name, tasksForList)
  }
}

module.exports = Opration
