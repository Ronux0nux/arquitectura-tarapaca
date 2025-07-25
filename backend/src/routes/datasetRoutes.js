const express = require('express');
const router = express.Router();
const multer = require('multer');
const datasetController = require('../controllers/datasetController');

//multer ayuda a subir archivos
const upload = multer({ dest: 'uploads/' });

router.post('/upload-dataset', upload.single('file'), datasetController.uploadDataset);

// Nueva ruta para guardar resultados de búsquedas SERPAPI
router.post('/save-search-results', datasetController.saveSearchResults);

module.exports = router;
