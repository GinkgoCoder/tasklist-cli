'use strict'
const { CREATE_TASK_TABLE_SQL, DROP_TASK_TABLE_SQL } = require('../../src/dao/sqls')
const { connectToDB, runSql } = require('../../src/util/db-util')
const path = require('path')
const TaskDao = require('../../src/dao/task-dao')
const Task = require('../../src/model/task')
const { Priority, Status } = require('../../src/model/enum')
const { expect } = require('chai')

describe('Task Dao Test', async () => {
  before('tear up', async () => {
    this.dbPath = path.join(__dirname, '..', 'resource', 'test.db')
    this.db = await connectToDB(this.dbPath)
    this.taskDao = new TaskDao(this.dbPath)
  })

  beforeEach('Initialize Task Table', async () => {
    await runSql(this.db, CREATE_TASK_TABLE_SQL)
  })

  it('should create tasks and list tasks', async () => {
    const task = new Task('test', Priority.NONE, Status.PENDING, 1, false, new Date(), new Date(), new Date())
    await this.taskDao.createTask(task)

    const receivedTasks = await this.taskDao.getAllTasks()

    task.setId(1)
    expect(receivedTasks.length).to.equal(1)
    expect(receivedTasks[0]).to.eql(task)
  })

  it('should delete the task', async () => {
    const task = new Task('test', Priority.NONE, Status.PENDING, 1, false, new Date(), new Date(), new Date())
    await this.taskDao.createTask(task)
    await this.taskDao.deleteTaskById(1)

    const receivedTasks = await this.taskDao.getAllTasks()

    expect(receivedTasks.length).to.equal(0)
  })

  it('should update the task', async () => {
    const task = new Task('test', Priority.NONE, Status.PENDING, 1, false, new Date(), new Date(), new Date())
    await this.taskDao.createTask(task)
    task.setId(1)
    task.description = 'updated text'
    await this.taskDao.updateTask(task)
    const receivedTasks = await this.taskDao.getAllTasks()
    expect(receivedTasks.length).to.equal(1)
    expect(receivedTasks[0]).to.eql(task)
  })

  it('should return empty array if there is no task', async () => {
    const tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(0)
  })

  it('should get tasks for the specified list id', async () => {
    const task1 = new Task('test1', Priority.NONE, Status.PENDING, 1, false, new Date(), new Date(), new Date())
    const task2 = new Task('test2', Priority.NONE, Status.PENDING, 1, false, new Date(), new Date(), new Date())
    const task3 = new Task('test3', Priority.NONE, Status.PENDING, 2, false, new Date(), new Date(), new Date())
    await this.taskDao.createTask(task1)
    await this.taskDao.createTask(task2)
    await this.taskDao.createTask(task3)
    task1.setId(1)
    task2.setId(2)
    task3.setId(3)
    const tasks = await this.taskDao.getTasksByListId(1)
    expect(tasks.length).to.equal(2)
    expect(tasks[0]).to.eql(task1)
    expect(tasks[1]).to.eql(task2)
  })

  afterEach('Drop the Task Table', async () => {
    await runSql(this.db, DROP_TASK_TABLE_SQL)
  })

  after('tear down', async () => await this.db.close())
})
