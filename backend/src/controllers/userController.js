const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//login de usuario
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = User.findAll().find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign(
      { userId: user.id, rol: user.rol },
      'secreto_super_seguro',
      { expiresIn: '1h' }
    );
    res.json({ token, usuario: { nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener todos los usuarios
exports.getUsers = (req, res) => {
  try {
    const users = User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear usuario nuevo

exports.createUser = async (req, res) => {
  try {
    const { nombre, email, rol, password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es obligatoria' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const result = User.create({ nombre, email, rol, passwordHash });
    res.status(201).json({ id: result.lastInsertRowid, nombre, email, rol });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
// Obtener un usuario por ID
exports.getUserById = (req, res) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar usuario
exports.updateUser = (req, res) => {
  try {
    const stmt = User.db.prepare(`UPDATE users SET nombre = ?, email = ?, rol = ?, passwordHash = ?, proyectos = ? WHERE id = ?`);
    stmt.run(req.body.nombre, req.body.email, req.body.rol, req.body.passwordHash, JSON.stringify(req.body.proyectos || []), req.params.id);
    const updated = User.findById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar usuario
exports.deleteUser = (req, res) => {
  try {
    const stmt = User.db.prepare(`DELETE FROM users WHERE id = ?`);
    stmt.run(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener supervisores y administradores para proyectos
exports.getSupervisores = (req, res) => {
  try {
    const supervisores = User.findAll().filter(u => ['supervisor', 'administrador', 'coordinador', 'coordinador de especialidades'].includes(u.rol));
    res.json(supervisores);
  } catch (err) {
    console.error('Error al obtener supervisores:', err);
    res.status(500).json({ error: err.message });
  }
};
