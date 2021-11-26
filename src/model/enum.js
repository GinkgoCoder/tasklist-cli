'use strict'

const Priority = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

const Status = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  BLOCK: 'block',
  COMPLETE: 'complete'
}

module.exports = {
  Priority: Priority,
  Status: Status
}
