'use strict'

const path = require('path')
const { connectToDB, runSql } = require('../../src/util/db-util')
const ListDao = require('../../src/dao/list-dao')
const {
  CREATE_LIST_TABLE_SQL,
  CREATE_TASK_TABLE_SQL,
  DROP_LIST_TABLE_SQL,
  DROP_TASK_TABLE_SQL
} = require('../../src/dao/sqls')
const ListService = require('../../src/service/list-service')
const { expect } = require('chai')
const { throws } = require('assert')
const { validateTodoException } = require('../util/test-util')
const ErrorCodes = require('../../src/exception/error-code')
const TaskService = require('../../src/service/task-service')

describe('List Service Test', () => {
  before('tear up', async () => {
    this.dbPath = path.join(__dirname, '..', 'resource', 'test.db')
    this.db = await connectToDB(this.dbPath)
    this.listService = new ListService(this.dbPath)
    this.taskService = new TaskService(this.dbPath)
    this.listDao = new ListDao(this.dbPath)
  })

  beforeEach('Initialize Table', async () => {
    await runSql(this.db, CREATE_TASK_TABLE_SQL)
    await runSql(this.db, CREATE_LIST_TABLE_SQL)
  })

  it('should create list', async () => {
    await this.listService.createList('Test')
    const lists = await this.listService.getLists()

    expect(lists.length).to.equal(1)
    expect(lists[0].name).to.equal('Test')
  })

  it('should update list name', async () => {
    await this.listService.createList('Test')
    await this.listService.updateListName('Test', 'Test2')
    const lists = await this.listService.getLists()

    expect(lists.length).to.equal(1)
    expect(lists[0].name).to.equal('Test2')
  })

  it(`should throw error when list doesn't exist`, async () => {
    try {
      await this.listService.updateListName('Test', 'Test2')
    } catch (e) {
      validateTodoException(e, ErrorCodes.INVALID_ARGUMENT, `List Test doesn't exist`)
      return
    }
    throw new Error('should throw an error')
  })

  it(`should delete list and its tasks`, async () => {
    await this.listService.createList('Test')
    await this.taskService.createTask('test1', 'Test')
    await this.taskService.createTask('test2', 'Test')

    await this.listService.deleteList('Test')
    const lists = await this.listService.getLists()
    const tasks = await this.taskService.getTasks()
    expect(lists.length).to.equal(0)
    expect(tasks.length).to.equal(0)
  })

  afterEach('Drop the Table', async () => {
    await runSql(this.db, DROP_TASK_TABLE_SQL)
    await runSql(this.db, DROP_LIST_TABLE_SQL)
  })

  after('tear down', async () => await this.db.close())
})
