'use strict'

const TaskDao = require('../dao/task-dao')
const ListDao = require('../dao/list-dao')
const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')
const List = require('../model/list')

class ListService {
  constructor (dbPath) {
    this.taskDao = new TaskDao(dbPath)
    this.listDao = new ListDao(dbPath)
  }

  async _validateAndGetListByName (name) {
    const lists = (await this.listDao.getLists()).filter(l => l.name === name)
    if (lists.length === 0) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, `List ${name} doesn't exist`)
    }
    return lists[0]
  }

  async createList (name) {
    await this.listDao.createList(new List(name))
  }

  async deleteList (name) {
    const list = await this._validateAndGetListByName(name)
    const tasks = (await this.taskDao.getAllTasks()).filter(t => t.list === list.id)

    for (const task of tasks) {
      await this.taskDao.deleteTaskById(task.id)
    }

    await this.listDao.deleteListById(list.id)
  }

  async updateListName (oldName, updatedName) {
    const updatedList = await this._validateAndGetListByName(oldName)
    updatedList.name = updatedName
    await this.listDao.updateList(updatedList)
  }

  async getLists () {
    return await this.listDao.getLists()
  }
}

module.exports = ListService
