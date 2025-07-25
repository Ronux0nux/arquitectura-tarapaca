const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excelController');

// Obtener plantillas Excel (no archivo existente)
router.get('/template', excelController.getExcelTemplate);

// Guardar datos del Excel (ya no necesario, se trabaja en memoria)
router.post('/save', excelController.saveExcelData);

// Agregar productos del dataset al Excel
router.post('/add-dataset', excelController.addDatasetToExcel);

// Exportar Excel para descarga
router.post('/export', excelController.exportExcel);

// Gestión de backups (opcional, para futuras funcionalidades)
router.get('/backups', excelController.getBackups);
router.post('/restore/:backupName', excelController.restoreBackup);

module.exports = router;
