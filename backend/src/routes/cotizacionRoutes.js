const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');

// Rutas generales
router.get('/', cotizacionController.getCotizaciones);
router.post('/', cotizacionController.createCotizacion);
router.get('/:id', cotizacionController.getCotizacionById);
router.put('/:id', cotizacionController.updateCotizacion);
router.delete('/:id', cotizacionController.deleteCotizacion);

// Rutas específicas por proyecto
router.get('/proyecto/:proyectoId', cotizacionController.getCotizacionesByProject);

// Rutas para cambio de estado
router.patch('/:id/aprobar', cotizacionController.aprobarCotizacion);
router.patch('/:id/rechazar', cotizacionController.rechazarCotizacion);

module.exports = router;
