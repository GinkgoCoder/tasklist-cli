
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
const ListCommand = require('../../src/command/list-command')

describe('List Command Test', () => {
  before('tear up', async () => {
    this.dbPath = path.join(__dirname, '..', 'resource', 'test.db')
    this.db = await connectToDB(this.dbPath)
    this.listDao = new ListDao(this.dbPath)
    this.listCommand = new ListCommand(this.dbPath, {
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
  })

  it('should create list', async () => {
    await this.listCommand.handle({ create: 'testList' })
    const lists = await this.listService.getLists()
    expect(lists.length).to.equal(1)
    expect(lists[0].name).to.equal('testList')
  })

  it('should not create list with the same name', async () => {
    await this.listCommand.handle({ create: 'testList' })
    await this.listCommand.handle({ create: 'testList' })
    const lists = await this.listService.getLists()
    expect(lists.length).to.equal(1)
    expect(lists[0].name).to.equal('testList')
  })

  it('should delete list with the name', async () => {
    await this.listCommand.handle({ create: 'testList' })
    let lists = await this.listService.getLists()
    expect(lists.length).to.equal(1)
    expect(lists[0].name).to.equal('testList')
    await this.listCommand.handle({ delete: 'testList' })
    lists = await this.listService.getLists()
    expect(lists.length).to.equal(0)
  })

  it('should update the list with the new name', async () => {
    await this.listCommand.handle({ create: 'testList' })
    let lists = await this.listService.getLists()
    expect(lists.length).to.equal(1)
    expect(lists[0].name).to.equal('testList')
    await this.listCommand.handle({ update: ['testList', 'testList2'] })
    lists = await this.listService.getLists()
    expect(lists.length).to.equal(1)
    expect(lists[0].name).to.equal('testList2')
  })

  afterEach('Drop the Table', async () => {
    await runSql(this.db, DROP_TASK_TABLE_SQL)
    await runSql(this.db, DROP_LIST_TABLE_SQL)
  })

  after('tear down', async () => await this.db.close())
})
