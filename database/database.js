const Sequelize = require('sequelize')

const connection = new Sequelize('blog', 'root', 'joao1802', {
  host: 'localhost',
  dialect: 'mysql',
  timezone: '-03:00'
})

module.exports = connection;