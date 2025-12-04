const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function syncDatabase() {
  try {
    await sequelize.sync({ force: false });
    console.log('Tablas sincronizadas correctamente');
  } catch (error) {
    console.error('Error sincronizando tablas:', error);
  }
}

module.exports = { sequelize, syncDatabase };
