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
const { Priority } = require('../../src/model/enum')

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

  afterEach('Drop the Table', async () => {
    await runSql(this.db, DROP_TASK_TABLE_SQL)
    await runSql(this.db, DROP_LIST_TABLE_SQL)
  })

  after('tear down', async () => await this.db.close())
})
