const express = require('express');
const router = express.Router();
const multer = require('multer');
const ordencompraController = require('../controllers/ordencompraController');

// Configuración de multer para subida de archivos
const upload = multer({ dest: 'uploads/' });

// Rutas generales
router.get('/', ordencompraController.getOrdenesCompra);
router.post('/', ordencompraController.createOrdenCompra);
router.get('/:id', ordencompraController.getOrdenCompraById);
router.put('/:id', ordencompraController.updateOrdenCompra);
router.delete('/:id', ordencompraController.deleteOrdenCompra);

// Rutas específicas por proyecto
router.get('/proyecto/:proyectoId', ordencompraController.getOrdenesCompraByProject);

// Rutas para creación desde cotización
router.post('/desde-cotizacion/:cotizacionId', ordencompraController.createOrdenFromCotizacion);

// Rutas para cambio de estado
router.patch('/:id/recibida', ordencompraController.marcarComoRecibida);

// Ruta para subir desde Excel
router.post('/upload', upload.single('file'), ordencompraController.uploadOrdenCompra);

module.exports = router;
