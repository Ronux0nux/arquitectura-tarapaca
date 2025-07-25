const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.get('/search', projectController.searchProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.get('/:id/materiales', projectController.getProjectMaterialSummary);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
