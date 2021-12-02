const Client = require('mysql-pro')

const db = new Client({
  mysql: {
    host: 'localhost',
    database: 'db_test',
    user: 'root',
    password: '20150416'
  }
})

module.exports = db;
