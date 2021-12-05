'use strict'

const ListService = require('../service/list-service')
const Render = require('../util/render')
const _ = require('lodash')
const TaskService = require('../service/task-service')
const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')
const validator = require('validator')
const { Priority, Status } = require('../model/enum')
const fs = require('fs')
const { HOME_DIR } = require('../util/constants')
const chileProcess = require('child_process')
const { join } = require('path')
const { readConfig } = require('../util/config')

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

  async _togglePendingInProgress (opts) {
    if (!validator.isInt(opts.start)) {
      return this.render.outputErrorMessage('Task id should be an integer')
    }

    try {
      await this.taskService.togglePendingInProgress(parseInt(opts.start))
      this.render.outputSuccessMessage(`Successfully update the status of the task ${opts.start}`)
    } catch (e) {
      this.logger.error(e.toString())
      if (e instanceof TodoException) {
        this.render.outputErrorMessage(e.message)
      }
      this.render.outputErrorMessage(`Failed to update the status of the task`)
    }
  }

  async _toggleInProgressComplete (opts) {
    if (!validator.isInt(opts.finish)) {
      return this.render.outputErrorMessage('Task id should be an integer')
    }

    try {
      await this.taskService.toggleInProgressComplete(parseInt(opts.finish))
      this.render.outputSuccessMessage(`Successfully update the status of the task ${opts.finish}`)
    } catch (e) {
      this.logger.error(e.toString())
      if (e instanceof TodoException) {
        this.render.outputErrorMessage(e.message)
      }
      this.render.outputErrorMessage(`Failed to update the status of the task`)
    }
  }

  async _toggleInProgressBlock (opts) {
    if (!validator.isInt(opts.block)) {
      return this.render.outputErrorMessage('Task id should be an integer')
    }

    try {
      await this.taskService.toggleBlockInProgress(parseInt(opts.block))
      this.render.outputSuccessMessage(`Successfully update the status of the task ${opts.block}`)
    } catch (e) {
      this.logger.error(e.toString())
      if (e instanceof TodoException) {
        this.render.outputErrorMessage(e.message)
      }
      this.render.outputErrorMessage(`Failed to update the status of the task`)
    }
  }

  async _toggleArchiveTasks (opts) {
    opts.archive = _.isArray(opts.archive) ? opts.archive : [opts.archive]

    if (!opts.archive.every(id => validator.isInt(id))) {
      return this.render.outputErrorMessage(`Task id should be an integer`)
    }

    const [successIds, failIds] = [[], []]

    for (const id of opts.archive) {
      try {
        await this.taskService.toggleTaskArchive(parseInt(id))
        successIds.push(id)
      } catch (e) {
        this.logger.error(e)
        failIds.push(id)
      }
    }

    if (successIds.length > 0) {
      this.render.outputSuccessMessage(`Successfully update the status of the tasks ${successIds}`)
    }

    if (failIds.length > 0) {
      this.render.outputErrorMessage(`Failed to update the status of the tasks ${failIds}`)
    }
  }

  async _clearTasks (opts) {
    let tasks = (await this.taskService.getTasks()).filter(t => !t.isArchived && t.status === Status.COMPLETE)

    if (opts.list) {
      const lists = (await this.listService.getLists()).filter(l => l.name === opts.list)
      if (lists.length === 0) {
        return this.render.outputErrorMessage(`The list ${opts.list} does not exist`)
      }
      tasks = tasks.filter(t => t.list === lists[0].id)
    }

    for (const task of tasks) {
      try {
        await this.taskService.toggleTaskArchive(parseInt(task.id))
      } catch (e) {
        this.logger.error(e)
      }
    }
    this.render.outputSuccessMessage(`Finish to clear the tasks`)
  }

  async _openTaskNote (opts) {
    if (!validator.isInt(opts.open)) {
      return this.render.outputErrorMessage('The task id should be an integer')
    }
    const tasks = (await this.taskService.getTasks()).filter(t => t.id === parseInt(opts.open))
    if (tasks.length === 0) {
      return this.render.outputErrorMessage(`The task id does not exist`)
    }

    const notePath = join(HOME_DIR, `${opts.open}.md`)

    if (!fs.existsSync(notePath)) {
      await fs.promises.writeFile(notePath, `# ${tasks[0].description}`)
      this._openNoteInEditor(notePath)
    } else {
      this._openNoteInEditor(notePath)
    }
  }

  async _openNoteInEditor (notePath) {
    let editor = process.env.EDITOR ? process.env.EDITOR : 'vi'
    if (process.platform.includes('win')) {
      editor = (await readConfig()).WINDOWS_EDITOR
    }
    chileProcess.spawn(editor, [notePath], {
      stdio: 'inherit'
    })
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
    } else if (opts.start) {
      await this._togglePendingInProgress(opts)
    } else if (opts.finish) {
      await this._toggleInProgressComplete(opts)
    } else if (opts.block) {
      await this._toggleInProgressBlock(opts)
    } else if (opts.archive) {
      await this._toggleArchiveTasks(opts)
    } else if (opts.clear) {
      await this._clearTasks(opts)
    } else if (opts.open) {
      await this._openTaskNote(opts)
    }
  }
}

module.exports = TaskCommand
