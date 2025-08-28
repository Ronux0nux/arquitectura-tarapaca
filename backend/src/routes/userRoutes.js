// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/logout', userController.logoutUser);
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/supervisores', userController.getSupervisores);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/login', userController.loginUser);

// Verificar token JWT
router.get('/verify', userController.verifyToken);

module.exports = router;
