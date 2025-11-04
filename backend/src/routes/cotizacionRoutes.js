const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');

// Rutas para cambio de estado múltiple (PRIMERO - antes de /:id)
router.post('/approve', cotizacionController.approveMateriales);
router.post('/reject', cotizacionController.rejectMateriales);

// Rutas específicas por proyecto (ANTES de /:id para evitar conflictos)
router.get('/project/:proyectoId', cotizacionController.getCotizacionesByProject);
router.get('/proyecto/:proyectoId', cotizacionController.getCotizacionesByProject);
// Obtener solo aprobadas
router.get('/project/:proyectoId/approved', cotizacionController.getAprobadasByProject);

// Rutas generales
router.get('/', cotizacionController.getCotizaciones);
router.post('/', cotizacionController.createCotizacion);

// Rutas con ID al final
router.get('/:id', cotizacionController.getCotizacionById);
router.get('/:id/audit', cotizacionController.getCotizacionAudit);
router.put('/:id', cotizacionController.updateCotizacion);
router.delete('/:id', cotizacionController.deleteCotizacion);
router.patch('/:id/aprobar', cotizacionController.aprobarCotizacion);
router.patch('/:id/rechazar', cotizacionController.rechazarCotizacion);

module.exports = router;
