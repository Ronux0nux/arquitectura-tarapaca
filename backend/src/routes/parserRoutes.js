const express = require('express');
const router = express.Router();
const multer = require('multer');
const parserController = require('../controllers/parserController');

// Configurar multer para uploads
const upload = multer({ dest: 'uploads/' });

/**
 * POST /api/parser/pdf
 * Procesar archivo PDF de forma asíncrona
 */
router.post('/pdf', upload.single('file'), parserController.parsePDF);

/**
 * POST /api/parser/excel
 * Procesar archivo Excel de forma asíncrona
 */
router.post('/excel', upload.single('file'), parserController.parseExcel);

/**
 * GET /api/parser/status/:type/:jobId
 * Obtener estado de procesamiento de un job
 * type: 'pdf' | 'excel'
 */
router.get('/status/:type/:jobId', parserController.getParseStatus);

/**
 * GET /api/parser/jobs
 * Listar todos los jobs activos
 * Query params: type (opcional): 'pdf' | 'excel'
 */
router.get('/jobs', parserController.listActiveJobs);

/**
 * POST /api/parser/validate
 * Validar formato de archivo
 */
router.post('/validate', upload.single('file'), parserController.validateFile);

module.exports = router;
