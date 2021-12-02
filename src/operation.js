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

  async _createList (opts) {
    try {
      await this.listService.createList(opts.create)
      this.render.outputSuccessMessage(`Successfully create the list ${opts.create}`)
    } catch (e) {
      error(e.message)
      this.render.outputErrorMessage(`Failed to create the list`)
    }
  }

  async _deleteList (opts) {
    try {
      // Todo It may need a prompt in inform that the tasks in the list will also be deleted
      await this.listService.deleteList(opts.delete)
      await this.render.outputSuccessMessage(`Successfully delete the list ${opts.delete}`)
    } catch (e) {
      error(e.message)
      await this.render.outputErrorMessage(`Failed to delete the list ${opts.delete}`)
    }
  }

  async _updateList (opts) {
    opts.update = _.isArray(opts.update) ? opts.update : [opts.update]
    if (opts.update.length < 2) {
      return this.render.outputErrorMessage(`Please provide the list name and the new list name. e.g: -u old new`)
    }
    try {
      await this.listService.updateListName(opts.update[0], opts.update[1])
      await this.render.outputSuccessMessage(`Successfully update the list ${opts.update[0]} with ${opts.update[1]}`)
    } catch (e) {
      error(e.message)
      await this.render.outputErrorMessage(`Failed to update the list ${opts.update[0]} with ${opts.update[1]}`)
    }
  }

  async listOperation (opts) {
    if (opts.create) {
      await this._createList(opts)
    } else if (opts.update) {
      await this._updateList(opts)
    } else if (opts.delete) {
      await this._deleteList(opts)
    }
  }
}

module.exports = Opration
