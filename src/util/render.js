
'use strict'
const { underline, grey, bold, blue, red, green, yellow, strikethrough } = require('chalk')
const figures = require('figures')
const { info } = require('../util/logger')
const { Status, Priority } = require('../model/enum')

const outputListTitle = async (title) => {
  await info(`${bold(blue(figures.hamburger))} ${underline(grey(title))}`)
}

const outputTask = async ({ prefix, message, suffix }) => {
  await info(`  ${prefix} ${message} ${suffix}`)
}

const _generateTaskPrefix = (task) => {
  switch (task.status) {
    case Status.PENDING:
      return `${figures.checkboxOff} ${task.id}`
    case Status.BLOCK:
      return `${red(figures.cross)} ${task.id}`
    case Status.COMPLETE:
      return `${green(figures.checkboxOn)} ${task.id}`
    case Status.IN_PROGRESS:
      return `${yellow('...')} ${task.id}`
  }
}

const _generateTaskSuffix = (task) => {
  switch (task.priority) {
    case Priority.HIGH:
      return `(${red('!!!')})`
    case Priority.MEDIUM:
      return `(${yellow('!!')})`
    case Priority.LOW:
      return `(!)`
    case Priority.NONE:
      return ''
  }
}

const renderTask = async (task) => {
  const taskOutput = {
    prefix: _generateTaskPrefix(task),
    message: task.status === Status.COMPLETE ? strikethrough(task.description) : task.description,
    suffix: _generateTaskSuffix(task)
  }
  await outputTask(taskOutput)
}

const sortTasksByStatus = (tasks) => {
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

exports.renderList = async (listName, tasks) => {
  await outputListTitle(listName)
  sortTasksByStatus(tasks)
  for (const task of sortTasksByStatus(tasks)) {
    renderTask(task)
  }
}
