const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

router.get('/users', adminUserController.getUsers);
router.get('/users/:id', adminUserController.getUser);
router.post('/users', adminUserController.createUser);
router.put('/users/:id', adminUserController.updateUser);
router.put('/users/:id/password', adminUserController.updateUserPassword);
router.delete('/users/:id', adminUserController.deleteUser);

module.exports = router;