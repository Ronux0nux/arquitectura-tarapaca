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

// ==================== SERVIR FRONTEND ====================
// 👉 Servir frontend (React build)
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Catch-all: enviar frontend para rutas que no sean API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

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
