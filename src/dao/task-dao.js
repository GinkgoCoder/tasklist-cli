'use strict'

const { CREATE_TASK_TABLE_SQL, CREAT_TASK_SQL, GET_TASKS_SQL, DELETE_TASK_SQL, UPDATE_TASK_SQL } = require('./sqls')
const { connectToDB, runSql, allSql } = require('../util/db-util')
const Task = require('../model/task')
const TodoException = require('../exception/todo-exception')
const ErrorCodes = require('../exception/error-code')

class TaskDao {
  constructor (sqlPath) {
    this.db = connectToDB(sqlPath)
  }

  async _createTaskTableIfNotExists () {
    await runSql(this.db, CREATE_TASK_TABLE_SQL)
  }

  _jsonToTask (obj) {
    const task = new Task(obj.description, obj.priority, obj.status, obj.list, obj.isArchived === '1',
      new Date(parseInt(obj.deadline)), new Date(parseInt(obj.createTime)), new Date(parseInt(obj.updateTime)))
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
      $createTime: task.createTime.getTime(),
      $updateTime: task.updateTime.getTime(),
      $deadline: task.deadline.getTime(),
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

  async deleteTaskById (id) {
    await runSql(this.db, DELETE_TASK_SQL, id)
  }

  async updateTask (task) {
    await runSql(this.db, UPDATE_TASK_SQL, this._buildValuesForSQL(task))
  }
}

module.exports = TaskDao
