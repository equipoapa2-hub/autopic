const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email y contraseña son requeridos'
                });
            }

            const user = await userService.authenticate(email, password);

            if (!user) {
                return res.status(401).json({
                    error: 'Credenciales inválidas'
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                user,
                token
            });

        } catch (error) {
            res.status(500).json({
                error: 'Error en el servidor durante el login'
            });
        }
    }
}

module.exports = new AuthController();