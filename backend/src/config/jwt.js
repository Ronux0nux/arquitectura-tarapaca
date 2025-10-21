/**
 * JWT Configuration
 * Manejo seguro de tokens JWT
 */

const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_cambiar_en_produccion';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secreto_cambiar_en_produccion';

// Tiempos de expiración
const TOKEN_EXPIRY = '24h'; // Access token: 24 horas
const REFRESH_EXPIRY = '7d'; // Refresh token: 7 días
const COOKIE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

// Generar tokens
const generateTokens = (userId, userRole) => {
  try {
    // Access token (corta duración)
    const accessToken = jwt.sign(
      { userId, role: userRole, type: 'access' },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Refresh token (larga duración)
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Error generando tokens:', error);
    throw error;
  }
};

// Verificar access token
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'access') {
      throw new Error('Token type inválido');
    }
    return decoded;
  } catch (error) {
    logger.warn('Token inválido:', error.message);
    throw error;
  }
};

// Verificar refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Token type inválido');
    }
    return decoded;
  } catch (error) {
    logger.warn('Refresh token inválido:', error.message);
    throw error;
  }
};

// Extraer token del header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Configuración de cookies
const getCookieOptions = () => ({
  httpOnly: true, // No accesible desde JavaScript (previene XSS)
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'strict', // Previene CSRF
  maxAge: COOKIE_EXPIRY,
  path: '/'
});

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  getCookieOptions,
  TOKEN_EXPIRY,
  REFRESH_EXPIRY,
  JWT_SECRET,
  REFRESH_SECRET
};
