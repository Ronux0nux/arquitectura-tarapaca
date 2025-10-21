const Redis = require('ioredis');
const logger = require('./logger');

// Configuración de Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 5000); // Aumentar delay máximo a 5 segundos
    return delay;
  },
  maxRetriesPerRequest: null, // null = infinitos reintentos
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000, // 10 segundos para conectar
  commandTimeout: 5000,  // 5 segundos por comando
  keepAlive: 30000,      // Keep-alive cada 30 segundos
};

// Crear cliente de Redis
const redisClient = new Redis(redisConfig);

// Eventos de conexión
redisClient.on('connect', () => {
  logger.info('✅ Redis conectado exitosamente');
});

redisClient.on('error', (err) => {
  logger.error(`❌ Error de Redis: ${err.message}`);
});

redisClient.on('ready', () => {
  logger.info('✅ Redis listo para usar');
});

redisClient.on('reconnecting', () => {
  logger.warn('⚠️  Redis reconectando...');
});

// Funciones helper para caché
const cache = {
  /**
   * Guardar en caché
   * @param {string} key - Clave única
   * @param {*} value - Valor a guardar (se serializa a JSON)
   * @param {number} ttl - Tiempo de vida en segundos (default: 3600 = 1 hora)
   */
  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      await redisClient.setex(key, ttl, serialized);
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`Error al guardar en cache ${key}: ${error.message}`);
      return false;
    }
  },

  /**
   * Obtener de caché
   * @param {string} key - Clave única
   * @returns {*} Valor deserializado o null si no existe
   */
  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (value) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Error al leer cache ${key}: ${error.message}`);
      return null;
    }
  },

  /**
   * Eliminar de caché
   * @param {string} key - Clave única
   */
  async del(key) {
    try {
      await redisClient.del(key);
      logger.debug(`Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar cache ${key}: ${error.message}`);
      return false;
    }
  },

  /**
   * Limpiar caché por patrón
   * @param {string} pattern - Patrón de búsqueda (ej: 'providers:*')
   */
  async clear(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info(`Cache CLEAR: ${keys.length} claves eliminadas (${pattern})`);
      }
      return keys.length;
    } catch (error) {
      logger.error(`Error al limpiar cache ${pattern}: ${error.message}`);
      return 0;
    }
  },

  /**
   * Verificar si existe una clave
   * @param {string} key - Clave única
   */
  async exists(key) {
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Error al verificar cache ${key}: ${error.message}`);
      return false;
    }
  },

  /**
   * Obtener tiempo de vida restante
   * @param {string} key - Clave única
   * @returns {number} Segundos restantes o -1 si no existe
   */
  async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error(`Error al obtener TTL de ${key}: ${error.message}`);
      return -1;
    }
  },
};

module.exports = {
  redisClient,
  cache,
};
