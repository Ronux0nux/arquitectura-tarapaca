const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//login de usuario
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar que el usuario existe
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // Generar token
    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      'secreto_super_seguro', // reemplázalo por una variable de entorno segura
      { expiresIn: '1h' }
    );

    res.json({ token, usuario: { nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
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

    const newUser = new User({ nombre, email, rol, passwordHash });
    await newUser.save();

    res.status(201).json(newUser);
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
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener supervisores y administradores para proyectos
exports.getSupervisores = async (req, res) => {
  try {
    // Buscar usuarios con rol de supervisor, administrador, o coordinador
    const supervisores = await User.find({
      rol: { $in: ['supervisor', 'administrador', 'coordinador', 'coordinador de especialidades'] }
    }).select('nombre email rol _id');
    
    res.json(supervisores);
  } catch (err) {
    console.error('Error al obtener supervisores:', err);
    res.status(500).json({ error: err.message });
  }
};
