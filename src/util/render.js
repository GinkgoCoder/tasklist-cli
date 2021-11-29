
const log = require('loglevel')
const chalk = require('chalk')
const signale = require('signale')
const figures = require('figures')
const { Signale, pending, success, pause } = require('signale')
const { Status } = require('../model/enum')

signale.config({ displayLabel: false })

const customiztion = {
  disabled: false,
  interactive: false,
  logLevel: 'info',
  secrets: [],
  stream: process.stdout,
  types: {
    list: {
      badge: chalk.bold(figures.hamburger),
      color: 'blue',
      label: '',
      logLevel: 'info'
    }
  }
}

const todoSignale = new Signale(customiztion)

const renderTask = async (task) => {
  switch (task.status) {
    case Status.PENDING:
      return pending({
        prefix: `  ${task.id}`,
        message: chalk.strikethrough(task.description)
      })
    case Status.BLOCK:
      return pause({
        prefix: `  ${task.id}`,
        message: task.description
      })
    case Status.COMPLETE:
      return success({
        prefix: `  ${task.id}`,
        message: chalk.strikethrough(task.description)
      })
    case Status.IN_PROGRESS:
      return signale.await({
        prefix: `  ${task.id}`,
        message: task.description
      })
  }
}

exports.renderList = async (listName, tasks) => {
  todoSignale.list(chalk.bold(chalk.gray(chalk.underline(listName))))
  sortTasksByStatus(tasks)
  for (const task of sortTasksByStatus(tasks)) {
    renderTask(task)
  }
}
function sortTasksByStatus (tasks) {
  const [pendings, inProgresss, blocks, completes] = [[], [], [], []]
  for (const task of tasks) {
    switch (task.status) {
      case Status.PENDING:
        pendings.push(task)
        break
      case Status.IN_PROGRESS:
        inProgresss.push(task)
        break
      case Status.BLOCK:
        blocks.push(task)
        break
      case Status.COMPLETE:
        completes.push(task)
        break
    }
  }
  return [...pendings, ...inProgresss, ...blocks, ...completes]
}
