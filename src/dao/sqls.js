
'use strict'
const { TASK_TABLE_NAME } = require('../util/constants')

exports.CREATE_TASK_TABLE_SQL = `CREATE TABLE IF NOT EXISTS ${TASK_TABLE_NAME} (
                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                              description TEXT NOT NULL,
                              list INTEGER NOT NULL,
                              priority TEXT NOT NULL,
                              status TEXT NOT NULL,
                              isArchived TEXT NOT NULL,
                              createTime TEXT NOT NULL,
                              updateTime TEXT NOT NULL,
                              deadline TEXT NOT NULL
                            );`

exports.DROP_TASK_TABLE_SQL = `DROP TABLE ${TASK_TABLE_NAME}`

exports.CREAT_TASK_SQL = `INSERT INTO ${TASK_TABLE_NAME} VALUES` +
    ` (NULL, $description, $list, $priority, $status, $isArchived, $createTime, $updateTime, $deadline)`

exports.GET_TASKS_SQL = `SELECT * FROM ${TASK_TABLE_NAME}`

exports.DELETE_TASK_SQL = `DELETE FROM ${TASK_TABLE_NAME} WHERE id=?`

exports.UPDATE_TASK_SQL = `UPDATE ${TASK_TABLE_NAME} SET description=$description, list=$list, priority=$priority, ` +
    `status=$status, createTime=$createTime, updateTime =$updateTime, deadline=$deadline, isArchived=$isArchived WHERE id=$id`
