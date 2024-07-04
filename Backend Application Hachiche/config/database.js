const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Remplace 'path/to/database.sqlite' par le chemin réel de ta base de données SQLite
});

module.exports = sequelize;
