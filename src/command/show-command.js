'use strict'

const ListService = require('../service/list-service')
const TaskService = require('../service/task-service')
const Render = require('../util/render')

class ShowCommand {
  constructor (dbPath, logger) {
    this.taskService = new TaskService(dbPath)
    this.listService = new ListService(dbPath)
    this.logger = logger
    this.render = new Render(logger)
  }

  async _showTaskForList (list) {
    const tasksForList = await this.taskService.getTasksByListId(list.id)
    this.render.renderList(list.name, tasksForList)
  }

  async handle (opts) {
    const lists = await this.listService.getLists()

    if (opts.list) {
      const filteredList = lists.filter(l => l.name === opts.list)
      if (filteredList.length > 0) {
        await this._showTaskForList(filteredList[0])
      }
    } else {
      for (const list of lists) {
        await this._showTaskForList(list)
      }
    }
  }
}

module.exports = ShowCommand
