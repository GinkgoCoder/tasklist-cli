'use strict'

const { Status } = require('../model/enum')
const ListService = require('../service/list-service')
const TaskService = require('../service/task-service')
const Render = require('../util/render')
const babar = require('babar')

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

  async _showStatics () {
    const completeTasks = (await this.taskService.getTasks()).filter(t => t.status === Status.COMPLETE)
    const taskNum7dyas = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]]
    const startTime = new Date()
    startTime.setDate(startTime.getDate() - 6)
    startTime.setHours(0, 0, 0)

    let max = 0

    for (const task of completeTasks) {
      const index = Math.floor((task.updateTime - Math.round(startTime.getTime() / 1000)) / 86400) % 7 + 1
      taskNum7dyas[index][1]++
      if (taskNum7dyas[index][1] > max) {
        max = taskNum7dyas[index][1]
      }
    }

    this.logger.info(babar(taskNum7dyas, {
      caption: 'Tasks finished in last 7 days',
      color: 'green',
      minY: 0,
      maxY: max === 0 ? 1 : max
    }))
  }

  async handle (opts) {
    const lists = await this.listService.getLists()
    this.logger.info('')

    if (opts.static) {
      await this._showStatics()
    } else if (opts.archive) {
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
