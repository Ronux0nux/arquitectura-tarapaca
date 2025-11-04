const { extractTokenFromHeader, verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Middleware que, si hay token Bearer válido, adjunta req.user con datos básicos.
 * No falla si no hay token; solo intenta resolver el usuario cuando el token es válido.
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = extractTokenFromHeader(authHeader) || req.cookies?.refreshToken || req.query?.token;
    if (!token) return next();

    try {
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.userId) {
        // Intentar cargar usuario desde caché o BD
        try {
          const user = await User.findById(decoded.userId);
          if (user) {
            // Adjuntar información mínima
            req.user = {
              id: user.id,
              name: user.name || user.nombre || user.email,
              nombre: user.nombre,
              email: user.email,
              rol: user.rol
            };
            req.logger && req.logger.debug && req.logger.debug(`Usuario autenticado: ${req.user.email}`);
          }
        } catch (err) {
          logger.warn('No se pudo obtener usuario para token:', err.message);
        }
      }
    } catch (err) {
      // Token inválido, ignorar silently
      // logger.warn('Token inválido en middleware attachUser:', err.message);
    }
  } catch (err) {
    // No bloquear la petición
    logger.warn('Error en attachUser middleware:', err.message);
  }

  next();
};
