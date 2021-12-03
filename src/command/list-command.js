'use strict'

const ListService = require('../service/list-service')
const Render = require('../util/render')
const _ = require('lodash')

class ListCommand {
  constructor (dbpath, logger) {
    this.listService = new ListService(dbpath)
    this.logger = logger
    this.render = new Render(logger)
  }

  async _createList (opts) {
    try {
      await this.listService.createList(opts.create)
      this.render.outputSuccessMessage(`Successfully create the list ${opts.create}`)
    } catch (e) {
      this.logger.error(e.toString())
      this.render.outputErrorMessage(`Failed to create the list`)
    }
  }

  async _deleteList (opts) {
    try {
      // Todo It may need a prompt in inform that the tasks in the list will also be deleted
      await this.listService.deleteList(opts.delete)
      await this.render.outputSuccessMessage(`Successfully delete the list ${opts.delete}`)
    } catch (e) {
      this.logger.error(e.toString())
      await this.render.outputErrorMessage(`Failed to delete the list ${opts.delete}`)
    }
  }

  async _updateList (opts) {
    opts.update = _.isArray(opts.update) ? opts.update : [opts.update]
    if (opts.update.length < 2) {
      return this.render.outputErrorMessage(`Please provide the list name and the new list name. e.g: -u old new`)
    }
    try {
      await this.listService.updateListName(opts.update[0], opts.update[1])
      await this.render.outputSuccessMessage(`Successfully update the list ${opts.update[0]} with ${opts.update[1]}`)
    } catch (e) {
      this.logger.error(e.toString())
      await this.render.outputErrorMessage(`Failed to update the list ${opts.update[0]} with ${opts.update[1]}`)
    }
  }

  async handle (opts) {
    if (opts.create) {
      await this._createList(opts)
    } else if (opts.update) {
      await this._updateList(opts)
    } else if (opts.delete) {
      await this._deleteList(opts)
    }
  }
}

module.exports = ListCommand
