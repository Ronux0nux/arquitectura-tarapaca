const express = require('express');
const router = express.Router();
const csvProviderController = require('../controllers/csvProviderController');

// Obtener todos los proveedores de CSV
router.get('/csv-providers', csvProviderController.getAllCSVProviders);

// Buscar proveedores en CSV
router.get('/csv-providers/search', csvProviderController.searchProviders);

// Obtener estadísticas de archivos CSV
router.get('/csv-providers/stats', csvProviderController.getProviderStats);

module.exports = router;
