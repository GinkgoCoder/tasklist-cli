
'use strict'
const { underline, grey, bold, blue, red, green, yellow, strikethrough, cyan } = require('chalk')
const figures = require('figures')
const { Status, Priority } = require('../model/enum')
const Table = require('cli-table')
const cliProgress = require('cli-progress')

class Render {
  constructor (loger) {
    this.logger = loger
  }

  async outputListTitle (title) {
    await this.logger.info(`${bold(blue(figures.hamburger))} ${underline(grey(title))}`)
  }

  async outputTask ({ prefix, message, suffix }) {
    await this.logger.info(`  ${prefix} ${message} ${suffix}`)
  }

  _generateContentTable () {
    return new Table({
      chars: {
        top: '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        bottom: '-',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        left: '',
        'left-mid': '',
        mid: '',
        'mid-mid': '',
        right: '',
        'right-mid': '',
        middle: ''
      },
      style: { 'padding-left': 2, 'padding-right': 0 },
      colAligns: ['middle', 'left', 'left', 'left'],
      colWidths: [8, 8, 50, 10]
    })
  }

  _generateHeadTable () {
    return new Table({
      chars: {
        top: '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        bottom: '-',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        left: '',
        'left-mid': '',
        mid: '',
        'mid-mid': '',
        right: '',
        'right-mid': '',
        middle: ''
      },
      style: { 'padding-left': 2, 'padding-right': 0 },
      colWidths: [8, 8, 50, 10]
    })
  }

  _generateTaskPrefix (task) {
    switch (task.status) {
      case Status.PENDING:
        return `${figures.checkboxOff}`
      case Status.BLOCK:
        return `${red(figures.cross)}`
      case Status.COMPLETE:
        return `${green(figures.checkboxOn)}`
      case Status.IN_PROGRESS:
        return `${yellow('...')}`
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
    return [this._generateTaskPrefix(task),
      task.id,
      task.status === Status.COMPLETE ? strikethrough(task.description) : task.description,
      this._generateTaskSuffix(task)
    ]
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
    return [pendings, inProgresss, blocks, completes]
  }

  async outputSuccessMessage (message) {
    await this.logger.info(`${bold(green(figures.tick))} ${message}`)
  }

  async outputErrorMessage (message) {
    await this.logger.info(`${bold(red(figures.cross))} ${message}`)
  }

  async renderList (listName, tasks) {
    await this.outputListTitle(listName)
    this.logger.info('')
    if (tasks.length > 0) {
      const contentTable = this._generateContentTable()
      const headTable = this._generateHeadTable()
      headTable.push([cyan('status'), cyan('id'), cyan('description'), cyan('priority')])
      for (const tasksByStatus of await this.sortTasksByStatus(tasks)) {
        for (const task of tasksByStatus) {
          contentTable.push(await this.renderTask(task))
        }
      }
      this.logger.info(headTable.toString())
      this.logger.info(contentTable.toString())
    } else {
      this.logger.info(grey('  No tasks'))
    }
    this.logger.info('')
  }

  async renderStatus (tasks) {
    const bar = new cliProgress.SingleBar({
      format: '| Progress |' + cyan('{bar}') + '| {percentage}% || {value}/{total}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    })
    const [pendings, inProgress, blocks, completes] = await this.sortTasksByStatus(tasks)
    bar.start(pendings.length + inProgress.length + blocks.length + completes.length, completes.length)
    bar.stop()
    const status = `| pending: ${cyan(pendings.length)} | inProgress: ${yellow(inProgress.length)} |` +
    ` block: ${red(blocks.length)} | complete: ${green(completes.length)} |`
    this.logger.info(status)
  }
}

module.exports = Render
