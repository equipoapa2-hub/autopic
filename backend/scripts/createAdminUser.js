require('dotenv').config();
const { sequelize, syncDatabase } = require('../src/config/database');
const { User } = require('../src/models');

async function createAdminUser() {
    try {
        await sequelize.authenticate();
        await syncDatabase();

        const adminUser = {
            name: 'John',
            lastName1: 'Doe',
            lastName2: 'Smith',
            email: 'john.doe@pic.com',
            phone: '9992223344',
            role: 'admin',
            passwordHash: 'helloworld'
        };

        const existingUser = await User.findOne({ where: { email: adminUser.email } });

        if (existingUser) {
            console.log('El usuario admin ya existe');
            process.exit(0);
        }

        const user = await User.create(adminUser);
        console.log('Usuario admin creado exitosamente:');
        console.log(`Email: ${user.email}`);
        console.log(`Contraseña: helloworld`);

    } catch (error) {
        console.error('Error creando usuario admin:', error.message);
    } finally {
        await sequelize.close();
    }
}

createAdminUser();