
'use strict'
const { underline, grey, bold, blue, red, green, yellow, strikethrough } = require('chalk')
const figures = require('figures')
const { Status, Priority } = require('../model/enum')

class Render {
  constructor (log) {
    this.log = log
  }

  async outputListTitle (title) {
    await this.log.info(`${bold(blue(figures.hamburger))} ${underline(grey(title))}`)
  }

  async outputTask ({ prefix, message, suffix }) {
    await this.log.info(`  ${prefix} ${message} ${suffix}`)
  }

  _generateTaskPrefix (task) {
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

  _generateTaskSuffix (task) {
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

  async renderTask (task) {
    const taskOutput = {
      prefix: this._generateTaskPrefix(task),
      message: task.status === Status.COMPLETE ? strikethrough(task.description) : task.description,
      suffix: this._generateTaskSuffix(task)
    }
    await this.outputTask(taskOutput)
  }

  async sortTasksByStatus (tasks) {
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

  async outputSuccessMessage (message) {
    await this.log.info(`${bold(green(figures.tick))} ${message}`)
  }

  async outputErrorMessage (message) {
    await this.log.info(`${bold(red(figures.cross))} ${message}`)
  }

  async renderList (listName, tasks) {
    await this.outputListTitle(listName)
    for (const task of await this.sortTasksByStatus(tasks)) {
      await this.renderTask(task)
    }
  }
}

module.exports = Render
