'use strict'

const { connectToDB, runSql, allSql } = require('../util/db-util')
const List = require('../model/list')
const { CREATE_LIST_SQL, GET_LISTS_SQL, DELETE_LIST_SQL, UPDATE_LIST_SQL } = require('./sqls')

class ListDao {
  constructor (dbPath) {
    this.db = connectToDB(dbPath)
  }

  _buildValuesForList (list) {
    return {
      $id: list.id,
      $name: list.name
    }
  }

  _jsonToList (obj) {
    const list = new List(obj.name)
    list.setId(obj.id)
    return list
  }

  async createList (list) {
    await runSql(this.db, CREATE_LIST_SQL, this._buildValuesForList(list))
  }

  async getLists () {
    return (await allSql(this.db, GET_LISTS_SQL)).map(obj => this._jsonToList(obj))
  }

  async updateList (list) {
    await runSql(this.db, UPDATE_LIST_SQL, this._buildValuesForList(list))
  }

  async deleteListById (id) {
    await runSql(this.db, DELETE_LIST_SQL, id)
  }
}

module.exports = ListDao
