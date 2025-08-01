const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB local esto no lo estoy usando, estoy usando MongoDB Atlas
// se cambia la URL de conexión en el archivo .env y de ahi se conecta a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB', err));
// Importar rutas
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

// Usar rutas API
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

// Ruta base de prueba (API)
app.get('/api', (req, res) => {
  res.send('API funcionando 🚀');
});

// 👉 Servir frontend (React build)
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Catch-all: enviar frontend para rutas que no sean API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
