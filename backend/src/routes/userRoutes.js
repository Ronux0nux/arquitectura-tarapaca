// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Autenticación
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);
router.get('/verify', userController.verifyToken);
router.post('/refresh-token', userController.refreshToken);
router.post('/revoke-token', userController.revokeRefreshToken);

// CRUD usuarios
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/supervisores', userController.getSupervisores);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
