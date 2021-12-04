'use strict'

const { padStart } = require('lodash')
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
    const tasksForList = (await this.taskService.getTasksByListId(list.id)).filter(t => !t.isArchived)
    await this.render.renderList(list.name, tasksForList)
    return tasksForList
  }

  async _showArchiveLists () {
    const archieveTasks = (await this.taskService.getTasks()).filter(t => t.isArchived)
    await this.render.renderList('Archived Tasks', archieveTasks)
  }

  async handle (opts) {
    const lists = await this.listService.getLists()

    if (opts.archive) {
      await this._showArchiveLists()
    } else if (opts.list) {
      const filteredList = lists.filter(l => l.name === opts.list)
      if (filteredList.length > 0) {
        const tasks = await this._showTaskForList(filteredList[0])
        await this.render.renderStatus(tasks)
      }
    } else {
      let tasks = []
      for (const list of lists) {
        tasks = [...tasks, ...(await this._showTaskForList(list))]
      }
      await this.render.renderStatus(tasks)
    }
  }
}

module.exports = ShowCommand
