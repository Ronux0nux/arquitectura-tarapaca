const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excelController');

// Obtener datos del Excel
router.get('/data', excelController.getExcelData);

// Guardar datos del Excel
router.post('/save', excelController.saveExcelData);

// Agregar productos del dataset al Excel
router.post('/add-dataset', excelController.addDatasetToExcel);

// Gestión de backups
router.get('/backups', excelController.getBackups);
router.post('/restore/:backupName', excelController.restoreBackup);

module.exports = router;
