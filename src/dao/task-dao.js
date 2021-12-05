'use strict'

const { CREATE_TASK_TABLE_SQL, CREAT_TASK_SQL, GET_TASKS_SQL, DELETE_TASK_SQL, UPDATE_TASK_SQL, GET_TASKS_BY_LIST_SQL } = require('./sqls')
const { connectToDB, runSql, allSql } = require('../util/db-util')
const Task = require('../model/task')
const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')

class TaskDao {
  constructor (dbPath) {
    this.db = connectToDB(dbPath)
  }

  async _createTaskTableIfNotExists () {
    await runSql(this.db, CREATE_TASK_TABLE_SQL)
  }

  _jsonToTask (obj) {
    const task = new Task(obj.description, obj.priority, obj.status, obj.list, obj.isArchived === '1',
      obj.deadline === 'NULL' ? undefined : new Date(obj.deadline),
      new Date(obj.createTime), new Date(obj.updateTime)
    )
    task.setId(obj.id)
    return task
  }

  _buildValuesForSQL (task) {
    return {
      $id: task.id,
      $description: task.description,
      $priority: task.priority,
      $status: task.status,
      $isArchived: task.isArchived,
      $createTime: Math.round(task.createTime.getTime() / 1000),
      $updateTime: Math.round(task.updateTime.getTime() / 1000),
      $deadline: task.deadline ? Math.round(task.deadline.getTime() / 1000) : 'NULL',
      $list: task.list
    }
  }

  async createTask (task) {
    if (!(task instanceof Task)) {
      throw new TodoException(ErrorCodes.INVALID_ARGUMENT, `Expected to get a task, but get ${typeof task}`)
    }
    await runSql(this.db, CREAT_TASK_SQL, this._buildValuesForSQL(task))
  }

  async getAllTasks () {
    return (await allSql(this.db, GET_TASKS_SQL)).map(obj => this._jsonToTask(obj))
  }

  async getTasksByListId (id) {
    return (await allSql(this.db, GET_TASKS_BY_LIST_SQL, id)).map(obj => this._jsonToTask(obj))
  }

  async deleteTaskById (id) {
    await runSql(this.db, DELETE_TASK_SQL, id)
  }

  async updateTask (task, updateTime = true) {
    if (updateTime) {
      task.updateTime = new Date()
    }
    await runSql(this.db, UPDATE_TASK_SQL, this._buildValuesForSQL(task))
  }
}

module.exports = TaskDao
