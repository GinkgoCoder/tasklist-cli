'use strict'
const { CREATE_LIST_TABLE_SQL, DROP_LIST_TABLE_SQL } = require('../../src/dao/sqls')
const { connectToDB, runSql } = require('../../src/util/db-util')
const path = require('path')
const ListDao = require('../../src/dao/list-dao')
const List = require('../../src/model/list')
const { expect } = require('chai')

describe('List Dao Test', async () => {
  before('tear up', async () => {
    this.dbPath = path.join(__dirname, '..', 'resource', 'test.db')
    this.db = await connectToDB(this.dbPath)
    this.listDao = new ListDao(this.dbPath)
  })

  beforeEach('Initialize List Table', async () => {
    await runSql(this.db, CREATE_LIST_TABLE_SQL)
  })

  it('should create list and get lists', async () => {
    const list = new List('testList')
    await this.listDao.createList(list)
    const realLists = await this.listDao.getLists()

    list.setId(1)
    expect(realLists.length).to.equal(1)
    expect(realLists[0]).to.eql(list)
  })

  it('should delete the list', async () => {
    const list = new List('testList')
    await this.listDao.createList(list)
    await this.listDao.deleteListById(1)

    const realLists = await this.listDao.getLists()
    expect(realLists.length).to.equal(0)
  })

  it('should update the list', async () => {
    const list = new List('testList')
    await this.listDao.createList(list)
    list.name = 'update list'
    list.id = 1
    await this.listDao.updateList(list)

    const realLists = await this.listDao.getLists()
    expect(realLists.length).to.equal(1)
    expect(realLists[0]).to.eql(list)
  })

  afterEach('Drop the List Table', async () => {
    await runSql(this.db, DROP_LIST_TABLE_SQL)
  })

  after('tear down', async () => await this.db.close())
})
