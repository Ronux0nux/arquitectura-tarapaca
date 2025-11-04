// Logout (dummy endpoint)
exports.logoutUser = (req, res) => {
  // Solo responde OK, el frontend borra el token
  res.status(200).json({ success: true, message: 'Logout exitoso' });
};
const User = require('../models/User');
const { generateTokens, verifyAccessToken, extractTokenFromHeader, getCookieOptions } = require('../config/jwt');
const logger = require('../config/logger');

// Verificar token JWT - Con caché en Redis y fallback
exports.verifyToken = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = extractTokenFromHeader(authHeader) || req.query.token;
  
  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token no proporcionado' });
  }
  
  try {
    // Verificar y decodificar token
    const decoded = verifyAccessToken(token);
    const cacheKey = `user:${decoded.userId}`;
    
    try {
      // Intentar obtener del caché primero
      const cachedUser = await req.cache.get(cacheKey);
      if (cachedUser) {
        logger.debug(`✅ Usuario desde caché: ${cachedUser.nombre || cachedUser.name || cachedUser.email}`);
        return res.json({
          valid: true,
          user: cachedUser,
          fromCache: true
        });
      }
    } catch (cacheError) {
      logger.warn(`⚠️ Error accediendo caché: ${cacheError.message}, continuando...`);
    }
    
    // Si no está en caché, buscar en BD
    try {
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ valid: false, error: 'Usuario no encontrado' });
      }
      
      const userData = {
        id: user.id,
        nombre: user.nombre,
        name: user.name || user.nombre || user.email || '',
        email: user.email,
        rol: user.rol,
        proyectos: user.proyectos || []
      };
      
      // Guardar en caché por 1 hora
      try {
        await req.cache.set(cacheKey, userData, 3600);
      } catch (cacheError) {
        logger.warn(`⚠️ Error guardando en caché: ${cacheError.message}`);
      }
      
      res.json({
        valid: true,
        user: userData,
        fromCache: false
      });
    } catch (dbError) {
      logger.error(`❌ Error en BD al verificar usuario: ${dbError.message}`);
      // Si falla la BD pero tenemos token válido, permitir acceso
      return res.status(503).json({ 
        valid: true,
        error: 'BD no disponible, usando sesión almacenada',
        message: 'Servicios limitados'
      });
    }
  } catch (err) {
    logger.warn(`⚠️ Error verificando token: ${err.message}`);
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
    
    // Generar tokens seguros
  const { accessToken, refreshToken } = generateTokens(user.id, user.rol);
    
    // Guardar refresh token en caché (7 días)
    try {
      await req.cache.set(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60);
    } catch (cacheError) {
      logger.warn(`⚠️ Error guardando refresh token en caché: ${cacheError.message}`);
    }
    
    // Configurar cookie con refresh token (HttpOnly, Secure, SameSite)
    const cookieOptions = getCookieOptions();
    res.cookie('refreshToken', refreshToken, cookieOptions);
    
    logger.info(`✅ Login exitoso para: ${user.email}`);
    
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        name: user.name || user.nombre || user.email || '',
        email: user.email,
        rol: user.rol
      }
    });
  } catch (err) {
    logger.error('Error en login:', err);
    res.status(500).json({ error: err.message });
  }
};

// Refrescar token JWT
exports.refreshToken = async (req, res) => {
  try {
    // Obtener refresh token de la cookie o del body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token no proporcionado' });
    }
    
    try {
      // Verificar y decodificar refresh token
      const { verifyRefreshToken } = require('../config/jwt');
      const decoded = verifyRefreshToken(refreshToken);
      
      // Verificar que el token está almacenado en caché (no fue revocado)
      const storedToken = await req.cache.get(`refresh:${decoded.userId}`);
      if (storedToken !== refreshToken) {
        return res.status(401).json({ error: 'Refresh token no válido o revocado' });
      }
      
      // Generar nuevo access token
      const { generateTokens } = require('../config/jwt');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      const { accessToken: newAccessToken } = generateTokens(user.id, user.rol);
      
      logger.info(`✅ Token refrescado para usuario: ${user.email}`);
      
      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: refreshToken // Puede ser el mismo o generarse uno nuevo
      });
    } catch (err) {
      logger.warn(`⚠️ Error refrescando token: ${err.message}`);
      res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }
  } catch (err) {
    logger.error('Error en refreshToken:', err);
    res.status(500).json({ error: err.message });
  }
};

// Revocar refresh token (logout)
exports.revokeRefreshToken = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requerido' });
    }
    
    // Eliminar refresh token del caché
    await req.cache.delete(`refresh:${userId}`);
    
    // Limpiar cookie
    res.clearCookie('refreshToken');
    
    logger.info(`✅ Refresh token revocado para usuario: ${userId}`);
    
    res.json({ success: true, message: 'Logout exitoso' });
  } catch (err) {
    logger.error('Error revocando refresh token:', err);
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
  res.status(201).json({ id: result.id, nombre, name: result.name || nombre || email, email, rol });
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
