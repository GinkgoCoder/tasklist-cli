'use strict'
const sqlite3 = require('sqlite3').verbose()

exports.connectToDB = function (path) {
  return new sqlite3.Database(path)
}

exports.runSql = function (db, sql, args) {
  return new Promise((resolve, reject) => {
    db.run(sql, args, err => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

exports.allSql = function (db, sql, args) {
  return new Promise((resolve, reject) => {
    db.all(sql, args, (err, data) => {
      if (err) {
        return reject(err)
      }
      if (data) {
        return resolve(data)
      }
    })
  })
}
