const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');

router.get('/', cotizacionController.getCotizaciones);
router.post('/', cotizacionController.createCotizacion);
router.get('/:id', cotizacionController.getCotizacionById);
router.put('/:id', cotizacionController.updateCotizacion);
router.delete('/:id', cotizacionController.deleteCotizacion);

module.exports = router;
