'use strict'

const Task = require('../model/task')
const TaskDao = require('../dao/task-dao')
const ListDao = require('../dao/list-dao')
const { DEFAULT_LIST } = require('../util/constants')
const { Priority, Status, validatePriority } = require('../model/enum')
const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')
class TaskService {
  constructor (dbPath) {
    this.taskDao = new TaskDao(dbPath)
    this.listDao = new ListDao(dbPath)
  }

  async _validateAndGetTaskById (id) {
    const tasks = (await this.taskDao.getAllTasks()).filter(t => t.id === id)
    if (tasks.length === 0) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, `Task with id ${id} doesn't exist`)
    }
    return tasks[0]
  }

  async _validateAndGetListByName (list) {
    const lists = (await this.listDao.getLists()).filter(l => l.name === list)
    if (lists.length === 0) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, `List ${list} doesn't exist`)
    }
    return lists[0]
  }

  async createTask (description, list = DEFAULT_LIST) {
    const l = await this._validateAndGetListByName(list)
    const task = new Task(description, Priority.NONE, Status.PENDING, l.id,
      false, undefined, new Date(), new Date())
    await this.taskDao.createTask(task)
  }

  async deleteTasks (id) {
    await this.taskDao.deleteTaskById(id)
  }

  async getTasks () {
    return await this.taskDao.getAllTasks()
  }

  async updateTaskDescription (id, description) {
    const updatedTask = await this._validateAndGetTaskById(id)
    updatedTask.description = description
    await this.taskDao.updateTask(updatedTask)
  }

  async updateTaskPriority (id, priority) {
    await validatePriority(priority)
    const updatedTask = await this._validateAndGetTaskById(id)
    updatedTask.priority = priority
    await this.taskDao.updateTask(updatedTask)
  }

  async updateTaskList (id, list) {
    const l = await this._validateAndGetListByName(list)
    const updatedTask = await this._validateAndGetTaskById(id)
    updatedTask.list = l.id
    await this.taskDao.updateTask(updatedTask)
  }

  async togglePendingInProgress (id) {
    const updatedTask = await this._validateAndGetTaskById(id)
    switch (updatedTask.status) {
      case Status.PENDING:
        updatedTask.status = Status.IN_PROGRESS
        break
      case Status.IN_PROGRESS:
        updatedTask.status = Status.PENDING
        break
      default:
        throw new TodoException(ErrorCodes.INVALID_STATUS, `Current status ${updatedTask.status} is not supported`)
    }
    await this.taskDao.updateTask(updatedTask)
  }

  async toggleInProgressComplete (id) {
    const updatedTask = await this._validateAndGetTaskById(id)
    switch (updatedTask.status) {
      case Status.IN_PROGRESS:
        updatedTask.status = Status.COMPLETE
        break
      case Status.COMPLETE:
        updatedTask.status = Status.IN_PROGRESS
        break
      default:
        throw new TodoException(ErrorCodes.INVALID_STATUS, `Current status ${updatedTask.status} is not supported`)
    }
    await this.taskDao.updateTask(updatedTask)
  }

  async toggleBlockInProgress (id) {
    const updatedTask = await this._validateAndGetTaskById(id)
    switch (updatedTask.status) {
      case Status.IN_PROGRESS:
        updatedTask.status = Status.BLOCK
        break
      case Status.BLOCK:
        updatedTask.status = Status.IN_PROGRESS
        break
      default:
        throw new TodoException(ErrorCodes.INVALID_STATUS, `Current status ${updatedTask.status} is not supported`)
    }
    await this.taskDao.updateTask(updatedTask)
  }

  async toggleTaskArchive (id) {
    const updatedTask = await this._validateAndGetTaskById(id)
    updatedTask.isArchived = !updatedTask.isArchived
    await this.taskDao.updateTask(updatedTask)
  }
}

module.exports = TaskService
