'use strict'

const path = require('path')
const { connectToDB, runSql } = require('../../src/util/db-util')
const {
  CREATE_LIST_TABLE_SQL,
  CREATE_TASK_TABLE_SQL,
  DROP_LIST_TABLE_SQL,
  DROP_TASK_TABLE_SQL,
  CREATE_LIST_SQL
} = require('../../src/dao/sqls')
const ListService = require('../../src/service/list-service')
const { expect } = require('chai')
const TaskCommand = require('../../src/command/task-command')
const { DEFAULT_LIST } = require('../../src/util/constants')
const TaskDao = require('../../src/dao/task-dao')
const { Priority, Status } = require('../../src/model/enum')

describe('Task Command Test', () => {
  before('tear up', async () => {
    this.dbPath = path.join(__dirname, '..', 'resource', 'test.db')
    this.db = await connectToDB(this.dbPath)
    this.taskDao = new TaskDao(this.dbPath)
    this.listCommand = new TaskCommand(this.dbPath, {
      info: () => {},
      error: () => {},
      warn: () => {},
      debug: () => {}
    })
    this.listService = new ListService(this.dbPath)
  })

  beforeEach('Initialize Table', async () => {
    await runSql(this.db, CREATE_TASK_TABLE_SQL)
    await runSql(this.db, CREATE_LIST_TABLE_SQL)
    await runSql(this.db, CREATE_LIST_SQL, DEFAULT_LIST)
    await runSql(this.db, CREATE_LIST_SQL, 'Test')
  })

  it('Should create task in default list', async () => {
    await this.listCommand.handle({ create: 'test' })
    const tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].description).to.equal('test')
    expect(tasks[0].list).to.equal(1)
  })

  it('Should create task in a specified list', async () => {
    await this.listCommand.handle({ create: 'test', list: 'Test' })
    const tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].description).to.equal('test')
    expect(tasks[0].list).to.equal(2)
  })

  it('Should delete a task', async () => {
    await this.listCommand.handle({ create: 'test' })
    await this.listCommand.handle({ delete: '1' })
    const tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(0)
  })

  it('Should delete multiple tasks', async () => {
    await this.listCommand.handle({ create: 'test' })
    await this.listCommand.handle({ create: 'test' })
    await this.listCommand.handle({ delete: ['1', '2'] })
    const tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(0)
  })

  it('Should update the task with the new description', async () => {
    await this.listCommand.handle({ create: 'test', list: 'Test' })
    await this.listCommand.handle({ update: ['1', 'test2'] })
    const tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].description).to.equal('test2')
  })

  it('Should update the task with the new description', async () => {
    await this.listCommand.handle({ create: 'test' })
    let tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].list).to.equal(1)
    await this.listCommand.handle({ move: '1', list: 'Test' })
    tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].list).to.equal(2)
  })

  it('Should update the task with the new description', async () => {
    await this.listCommand.handle({ create: 'test' })
    let tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].priority).to.equal(Priority.NONE)
    await this.listCommand.handle({ priority: ['1', 'high'] })
    tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].priority).to.equal(Priority.HIGH)
  })

  it('Should change the task status between pending and in-progress', async () => {
    await this.listCommand.handle({ create: 'test' })
    await this.listCommand.handle({ start: '1' })
    let tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.IN_PROGRESS)
    await this.listCommand.handle({ start: '1' })
    tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.PENDING)
  })

  it('Should change the task status between in-progress and complete', async () => {
    await this.listCommand.handle({ create: 'test' })
    await this.listCommand.handle({ start: '1' })
    await this.listCommand.handle({ finish: '1' })
    let tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.COMPLETE)
    await this.listCommand.handle({ finish: '1' })
    tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.IN_PROGRESS)
  })

  it('Should change the task status between in-progress and block', async () => {
    await this.listCommand.handle({ create: 'test' })
    await this.listCommand.handle({ start: '1' })
    await this.listCommand.handle({ block: '1' })
    let tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.BLOCK)
    await this.listCommand.handle({ block: '1' })
    tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.IN_PROGRESS)
  })

  it('Should archive the tasks', async () => {
    await this.listCommand.handle({ create: 'test' })
    await this.listCommand.handle({ archive: '1' })
    let tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].isArchived).to.equal(true)
    await this.listCommand.handle({ archive: '1' })
    tasks = await this.taskDao.getAllTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].isArchived).to.equal(false)
  })

  it('Should clear all the tasks', async () => {
    await this.listCommand.handle({ create: 'test1' })
    await this.listCommand.handle({ create: 'test2', list: 'Test' })
    await this.listCommand.handle({ start: '1' })
    await this.listCommand.handle({ finish: '1' })
    await this.listCommand.handle({ start: '2' })
    await this.listCommand.handle({ finish: '2' })
    await this.listCommand.handle({ clear: true })

    const tasks = await this.taskDao.getAllTasks()
    for (const task of tasks) {
      expect(task.isArchived).to.equal(true)
    }
  })

  it('Should clear all the tasks in a list', async () => {
    await this.listCommand.handle({ create: 'test1' })
    await this.listCommand.handle({ create: 'test2', list: 'Test' })
    await this.listCommand.handle({ start: '1' })
    await this.listCommand.handle({ finish: '1' })
    await this.listCommand.handle({ start: '2' })
    await this.listCommand.handle({ finish: '2' })
    await this.listCommand.handle({ clear: true, list: 'Test' })

    const tasks = await this.taskDao.getAllTasks()
    for (const task of tasks) {
      if (task.id === 1) {
        expect(task.isArchived).to.equal(false)
      } else {
        expect(task.isArchived).to.equal(true)
      }
    }
  })

  afterEach('Drop the Table', async () => {
    await runSql(this.db, DROP_TASK_TABLE_SQL)
    await runSql(this.db, DROP_LIST_TABLE_SQL)
  })

  after('tear down', async () => await this.db.close())
})
