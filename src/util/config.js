'use strict'

const fs = require('fs')
const { join } = require('path')
const { HOME_DIR } = require('./constants')

exports.readConfig = async () => {
  const rawdata = fs.readFileSync(join(HOME_DIR, 'todo.json'))
  return JSON.parse(rawdata)
}
