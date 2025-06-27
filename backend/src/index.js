const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/arquitectura_tarapaca', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});

// Importar rutas de usuario
const userRoutes = require('./routes/userRoutes');
// Importar rutas de proyecto
const projectRoutes = require('./routes/projectRoutes');
// Importar rutas de proveedor
const providerRoutes = require('./routes/providerRoutes');
// Importar rutas de cotización
const cotizacionRoutes = require('./routes/cotizacionRoutes');
// Importar rutas de insumo
const insumoRoutes = require('./routes/insumoRoutes');
// Importar rutas de dataset
const datasetRoutes = require('./routes/datasetRoutes');

// Usar rutas de usuario
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/dataset', datasetRoutes);
