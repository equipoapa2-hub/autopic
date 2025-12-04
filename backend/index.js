require('dotenv').config();
const app = require('./src/app');
const { sequelize, syncDatabase } = require('./src/config/database');

const PORT = process.env.PORT;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente');

    await syncDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

startServer();