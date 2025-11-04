const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

// Importar configuraciones
const logger = require('./config/logger');
const { redisClient, cache } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 5000;
const fs = require('fs');

// Middleware que adjunta req.user si hay un token válido (no exige auth)
const attachUser = require('./middleware/attachUser');

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// Middleware de logging con Morgan
app.use(morgan('combined', { stream: logger.stream }));

// Middleware para agregar logger y cache a req
app.use((req, res, next) => {
  req.logger = logger;
  req.cache = cache;
  next();
});

// Adjuntar usuario autenticado cuando exista token Bearer (no bloqueante)
app.use(attachUser);

// Registrar acciones mutantes con el usuario (POST/PUT/DELETE) para auditoría ligera
app.use((req, res, next) => {
  try {
    const method = req.method && req.method.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const actor = req.user ? `${req.user.name || req.user.email} (${req.user.id})` : 'anon';
      logger.info(`🔒 Acción: ${method} ${req.path} por ${actor}`);
    }
  } catch (e) {
    // no bloquear
  }
  next();
});

// ----- Fix rápido: normalizar rutas con doble prefijo '/api/api' -----
// Si el frontend (o proxy) genera '/api/api/...' reescribimos a '/api/...'
// Esto evita 500 por intento de servir frontend inexistente y es reversible.
app.use((req, res, next) => {
  try {
    if (req.path === '/api/api' || req.path === '/api/api/') {
      req.url = req.url.replace(/^\/api\/api\/?/, '/api');
    } else if (req.path.startsWith('/api/api/')) {
      req.url = req.url.replace(/^\/api\/api/, '/api');
    }
  } catch (e) {
    // No bloquear la petición si ocurre algún error aquí
    console.warn('Error al normalizar URL:', e && e.message);
  }
  next();
});

// ==================== IMPORTAR RUTAS ====================
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const providerRoutes = require('./routes/providerRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const insumoRoutes = require('./routes/insumoRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const actaReunionRoutes = require('./routes/actaReunionRoutes');
const searchRoutes = require('./routes/searchRoutes');
const ordencompraRoutes = require('./routes/ordencompraRoutes');
const excelRoutes = require('./routes/excelRoutes');
const csvProviderRoutes = require('./routes/csvProviderRoutes');
const templateRoutes = require('./routes/templateRoutes');
const parserRoutes = require('./routes/parserRoutes'); // 🆕 Nuevo módulo Parser
const chatbotRoutes = require('./routes/chatbotRoutes'); // 🤖 Chatbot con IA

// ==================== USAR RUTAS API ====================
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/ordenes-compra', ordencompraRoutes);
app.use('/api/dataset', datasetRoutes);
app.use('/api/actas-reunion', actaReunionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api', csvProviderRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/parser', parserRoutes); // 🆕 Nuevo módulo Parser
app.use('/api/chatbot', chatbotRoutes); // 🤖 Chatbot con IA

// ==================== RUTAS BASE ====================
// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    redis: redisClient.status,
  });
});

// Ruta base de prueba (API)
app.get('/api', (req, res) => {
  res.send('API funcionando 🚀');
});

// ==================== SERVIR FRONTEND (solo si existe build) ====================
// Servimos el build de React únicamente si la carpeta existe para evitar errores ENOENT
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  // 👉 Servir frontend (React build)
  app.use(express.static(frontendBuildPath));

  // Catch-all: enviar frontend para rutas que no sean API
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // Si no existe el build, no registramos el catch-all; las rutas API no resueltas devolverán 404
  console.warn('Frontend build no encontrado en:', frontendBuildPath);
}

// ==================== MANEJO DE ERRORES ====================
app.use((err, req, res, next) => {
  logger.error(`Error no manejado: ${err.message}`);
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('❌ Excepción no capturada:', error);
  console.error('❌ Excepción no capturada:', error);
});

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  console.error('❌ Promesa rechazada no manejada:', reason);
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔴 Redis: ${redisClient.status}`);
});

// ==================== MANEJO DE CIERRE GRACEFUL ====================
process.on('SIGTERM', async () => {
  logger.info('⚠️  SIGTERM recibido, cerrando servidor...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('⚠️  SIGINT recibido, cerrando servidor...');
  await redisClient.quit();
  process.exit(0);
});
