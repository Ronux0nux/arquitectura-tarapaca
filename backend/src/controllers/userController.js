// Logout (dummy endpoint)
exports.logoutUser = (req, res) => {
  // Solo responde OK, el frontend borra el token
  res.status(200).json({ success: true, message: 'Logout exitoso' });
};
const User = require('../models/User');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt'); // Si usas bcrypt para contraseñas

// Verificar token JWT
exports.verifyToken = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  try {
    const decoded = jwt.verify(token, 'secreto_super_seguro');
    res.json({ valid: true, decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Token inválido o expirado' });
  }
};

// login de usuario
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await User.findAll();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    // Si usas bcrypt:
    // const validPassword = await bcrypt.compare(password, user.password);
    // if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });
    // Si usas texto plano:
    if (password !== user.password) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign(
      { userId: user.id, rol: user.rol },
      'secreto_super_seguro',
      { expiresIn: '1h' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.email,
        role: user.rol
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
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
    // Validar email único
    const users = await User.findAll();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    const result = await User.create({ nombre, email, rol, password });
    res.status(201).json({ id: result.id, nombre, email, rol });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener supervisores y administradores para proyectos
exports.getSupervisores = async (req, res) => {
  try {
    const users = await User.findAll();
    const supervisores = users.filter(u => ['supervisor', 'administrador', 'coordinador', 'coordinador de especialidades'].includes(u.rol));
    res.json(supervisores);
  } catch (err) {
    console.error('Error al obtener supervisores:', err);
    res.status(500).json({ error: err.message });
  }
};
