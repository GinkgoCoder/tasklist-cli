#!/usr/bin/env node

const fs = require('fs')
const { CREATE_TASK_TABLE_SQL, CREATE_LIST_TABLE_SQL, CREATE_LIST_SQL } = require('./dao/sqls')
const { runSql, connectToDB } = require('./util/db-util')
const { join } = require('path')
const { HOME_DIR, DEFAULT_LIST } = require('./util/constants')
const { Command } = require('commander')
const Opration = require('./operation')
const program = new Command()
const log = require('./util/logger')
const Render = require('./util/render')

const dbPath = join(HOME_DIR, 'todo.db')
const initialize = async () => {
  if (!fs.existsSync(HOME_DIR)) {
    fs.mkdirSync(HOME_DIR)
  }
  if (!fs.existsSync(dbPath)) {
    const db = connectToDB(dbPath)
    await runSql(db, CREATE_TASK_TABLE_SQL)
    await runSql(db, CREATE_LIST_TABLE_SQL)
    await runSql(db, CREATE_LIST_SQL, DEFAULT_LIST)
  }
}

const main = async () => {
  await initialize()
}

main()

const operation = new Opration(dbPath, new Render(log))

program.version('1.0.0')

program.command('task')
  .alias('t')
  .description('Task Operation')
  .option('-c --create <task>', 'create task')
  .option('-d --delete <ids>', 'delete taskd')
  .option('-u --update <id description...>', 'update task description')
  .option('-m --move <id>', 'move task to anothe list')
  .option('-p --priority <id> <priority>', 'set task priority')
  .option('-s --start <id>', 'start or stop task')
  .option('-b --block <id>', 'block or unblock task in progress')
  .option('-c --complete <id>', 'complete or restart the task')
  .option('-a --archive <ids>', 'archieve the tasks')
  .option('-r --restore <ids>', 'restore the tasks')
  .option('-l --list <list>', 'specify list during task creation')
  .action(async opts => operation.taskOperation(opts))

program.command('list')
  .alias('l')
  .description('List Opration')
  .option('-c --create <list>', 'create list')
  .option('-d --delete <list>', 'delete list')
  .option('-u --update <oldvalue newvalue...>', 'update list')
  .action(async opts => operation.listOperation(opts))

program.command('show')
  .alias('s')
  .option('-a --archive', 'show all tasks')
  .option('-l --list <list>', 'show the task in the specified list')
  .action(async opts => operation.showTasks(opts))

program.parse(process.argv)
