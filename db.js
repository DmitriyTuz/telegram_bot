const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'telegram_bot',
    'postgres',
    '1111',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
        // logging: false
    }
)