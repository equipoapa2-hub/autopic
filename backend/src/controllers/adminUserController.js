const userService = require('../services/userService');

class AdminUserController {
  async getUsers(req, res) {
    try {
      const { search, role } = req.query;
      const filters = {};
      
      if (search) filters.search = search;
      if (role) filters.role = role;

      const users = await userService.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      res.status(404).json({
        error: error.message
      });
    }
  }

  async createUser(req, res) {
    try {
      const userData = req.body;
      const user = await userService.create(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = await userService.updateProfile(id, updateData);
      res.json(user);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async updateUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      await userService.updatePassword(id, newPassword);
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
}

module.exports = new AdminUserController();