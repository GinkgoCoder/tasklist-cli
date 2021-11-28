'use strict'

const path = require('path')
const { connectToDB, runSql } = require('../../src/util/db-util')
const TaskService = require('../../src/service/task-service')
const ListDao = require('../../src/dao/list-dao')
const List = require('../../src/model/list')
const {
  CREATE_LIST_TABLE_SQL,
  CREATE_TASK_TABLE_SQL,
  DROP_LIST_TABLE_SQL,
  DROP_TASK_TABLE_SQL
} = require('../../src/dao/sqls')
const { DEFAULT_LIST } = require('../../src/util/constants')
const { expect } = require('chai')
const { Priority, Status } = require('../../src/model/enum')
const ErrorCodes = require('../../src/exception/error-code')
const { validateTodoException } = require('../util/test-util')

describe('Task Service Test', () => {
  before('tear up', async () => {
    this.dbPath = path.join(__dirname, '..', 'resource', 'test.db')
    this.db = await connectToDB(this.dbPath)
    this.taskService = new TaskService(this.dbPath)
    this.listDao = new ListDao(this.dbPath)
  })

  beforeEach('Initialize Task Table', async () => {
    await runSql(this.db, CREATE_TASK_TABLE_SQL)
    await runSql(this.db, CREATE_LIST_TABLE_SQL)
    await this.listDao.createList(new List(DEFAULT_LIST))
    await this.listDao.createList(new List('Test'))
  })

  it('should create a task in default list and get task', async () => {
    await this.taskService.createTask('test')
    const tasks = await this.taskService.getTasks()

    expect(tasks.length).to.equal(1)
    expect(tasks[0].id).to.equal(1)
    expect(tasks[0].description).to.equal('test')
    expect(tasks[0].list).to.equal(1)
    expect(tasks[0].priority).to.equal(Priority.NONE)
    expect(tasks[0].status).to.equal(Status.PENDING)
    expect(tasks[0].deadline).to.equal(undefined)
  })

  it('should create a task in the specified list', async () => {
    await this.taskService.createTask('test', 'Test')
    const tasks = await this.taskService.getTasks()

    expect(tasks.length).to.equal(1)
    expect(tasks[0].id).to.equal(1)
    expect(tasks[0].description).to.equal('test')
    expect(tasks[0].list).to.equal(2)
    expect(tasks[0].priority).to.equal(Priority.NONE)
    expect(tasks[0].status).to.equal(Status.PENDING)
    expect(tasks[0].deadline).to.equal(undefined)
  })

  it('should throw error when specified list does not exist', async () => {
    try {
      await this.taskService.createTask('test', 'Unknown')
    } catch (e) {
      validateTodoException(e, ErrorCodes.INVALID_ARGUMENT, `List Unknown doesn't exist`)
      return
    }
    throw new Error('should throw error')
  })

  it('should delete task', async () => {
    await this.taskService.createTask('test1')

    await this.taskService.deleteTasks(1)
    const tasks = await this.taskService.getTasks()

    expect(tasks.length).to.equal(0)
  })

  it('should update task description', async () => {
    await this.taskService.createTask('test')
    await this.taskService.updateTaskDescription(1, 'test2')

    const tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].description).to.equal('test2')
  })

  it('should throw error for description update when task is not existed', async () => {
    try {
      await this.taskService.updateTaskDescription(1, 'test2')
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_ARGUMENT, `Task with id 1 doesn't exist`)
      return
    }
    throw new Error('should throw error')
  })

  it('should update task priority', async () => {
    await this.taskService.createTask('test')
    await this.taskService.updateTaskPriority(1, Priority.HIGH)

    const tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].priority).to.equal(Priority.HIGH)
  })

  it('should throw error for priority update when task is not existed', async () => {
    try {
      await this.taskService.updateTaskPriority(1, Priority.HIGH)
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_ARGUMENT, `Task with id 1 doesn't exist`)
      return
    }
    throw new Error('should throw error')
  })

  it('should throw error for priority update when priority is not supported', async () => {
    await this.taskService.createTask('test')
    try {
      await this.taskService.updateTaskPriority(1, 'test2')
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_ARGUMENT,
        `Priority test2 not supported, only support high, medium, low and none`)
      return
    }
    throw new Error('should throw an error')
  })

  it('should update task list', async () => {
    await this.taskService.createTask('test')
    await this.taskService.updateTaskList(1, 'Test')

    const tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].list).to.equal(2)
  })

  it('should throw error for list update when task is not existed', async () => {
    try {
      await this.taskService.updateTaskList(1, 'Test')
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_ARGUMENT, `Task with id 1 doesn't exist`)
      return
    }
    throw new Error('should throw an error')
  })

  it('should throw error for list update when list is not existed', async () => {
    try {
      await this.taskService.updateTaskList(1, 'Test2')
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_ARGUMENT, `List Test2 doesn't exist`)
      return
    }
    throw new Error('should throw an error')
  })

  it('should toggle between pending and in progress', async () => {
    await this.taskService.createTask('test')
    await this.taskService.togglePendingInProgress(1)
    let tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.IN_PROGRESS)
    await this.taskService.togglePendingInProgress(1)
    tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.PENDING)
  })

  it('should throw error for unsupported status for toggling between pending and in progress', async () => {
    try {
      await this.taskService.createTask('test')
      await this.taskService.togglePendingInProgress(1)
      await this.taskService.toggleBlockInProgress(1)
      await this.taskService.togglePendingInProgress(1)
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_STATUS, 'Current status block is not supported')
      return
    }
    throw new Error('should throw an error')
  })

  it('should toggle between block and in progress', async () => {
    await this.taskService.createTask('test')
    await this.taskService.togglePendingInProgress(1)
    await this.taskService.toggleBlockInProgress(1)
    let tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.BLOCK)
    await this.taskService.toggleBlockInProgress(1)
    tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.IN_PROGRESS)
  })

  it('should throw error for unsupported status for toggling between block and in progress', async () => {
    try {
      await this.taskService.createTask('test')
      await this.taskService.toggleBlockInProgress(1)
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_STATUS, 'Current status pending is not supported')
      return
    }
    throw new Error('should throw an error')
  })

  it('should toggle between complete and in progress', async () => {
    await this.taskService.createTask('test')
    await this.taskService.togglePendingInProgress(1)
    await this.taskService.toggleInProgressComplete(1)
    let tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.COMPLETE)
    await this.taskService.toggleInProgressComplete(1)
    tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].status).to.equal(Status.IN_PROGRESS)
  })

  it('should throw error for unsupported status for toggling between complete and in progress', async () => {
    try {
      await this.taskService.createTask('test')
      await this.taskService.toggleBlockInProgress(1)
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_STATUS, 'Current status pending is not supported')
      return
    }
    throw new Error('should throw an error')
  })

  it('should toggle archive for task', async () => {
    await this.taskService.createTask('test')
    await this.taskService.toggleTaskArchive(1)

    let tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].isArchived).to.equal(true)

    await this.taskService.toggleTaskArchive(1)
    tasks = await this.taskService.getTasks()
    expect(tasks.length).to.equal(1)
    expect(tasks[0].isArchived).to.equal(false)
  })

  it('should throw error for toggle archive when task is not existed', async () => {
    try {
      await this.taskService.toggleTaskArchive(1, 'Test')
    } catch (error) {
      validateTodoException(error, ErrorCodes.INVALID_ARGUMENT, `Task with id 1 doesn't exist`)
      return
    }
    throw new Error('should throw an error')
  })

  afterEach('Drop the Task Table', async () => {
    await runSql(this.db, DROP_TASK_TABLE_SQL)
    await runSql(this.db, DROP_LIST_TABLE_SQL)
  })

  after('tear down', async () => await this.db.close())
})
