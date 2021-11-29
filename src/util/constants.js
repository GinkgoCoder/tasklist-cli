'use strict'
const { join } = require('path')
const SYSTEM_HOME_DIR = require('os').homedir()

exports.TASK_TABLE_NAME = 'task'
exports.LIST_TABLE_NAME = 'list'
exports.DEFAULT_LIST = 'Inbox'
exports.HOME_DIR = join(SYSTEM_HOME_DIR, '.todo')
