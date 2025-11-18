const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const upload = require('../middleware/upload');

router.get('/', projectController.getProjects);
// Vincular proveedor a proyecto
router.post('/:id/providers', projectController.linkProviderToProject);
router.get('/search', projectController.searchProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.get('/:id/materiales', projectController.getProjectMaterialSummary);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Gestión de Proyectos - Hitos
router.get('/:id/hitos', projectController.getProjectHitos);
router.post('/:id/hitos', projectController.createHito);
router.put('/:id/hitos/:hitoId', projectController.updateHito);
router.delete('/:id/hitos/:hitoId', projectController.deleteHito);

// Gestión de Proyectos - Gastos
router.get('/:id/gastos', projectController.getProjectGastos);
router.post('/:id/gastos', projectController.createGasto);
router.put('/:id/gastos/:gastoId', projectController.updateGasto);
router.delete('/:id/gastos/:gastoId', projectController.deleteGasto);

// Gestión de Proyectos - Archivos
router.get('/:id/archivos', projectController.getProjectArchivos);
router.post('/:id/archivos', upload.single('archivo'), projectController.uploadArchivo);
router.get('/:id/archivos/:archivoId/download', projectController.downloadArchivo);
router.delete('/:id/archivos/:archivoId', projectController.deleteArchivo);

// Gestión de Proyectos - Alertas
router.get('/:id/alertas', projectController.getProjectAlertas);
router.put('/:id/alertas/:alertaId/resolver', projectController.resolverAlerta);

// Gestión de Proyectos - Dashboard
router.get('/:id/dashboard', projectController.getProjectDashboard);

module.exports = router;
