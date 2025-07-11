const express = require('express');
const router = express.Router();
const actaReunionController = require('../controllers/actaReunionController');

router.get('/', actaReunionController.getActas);
router.get('/search', actaReunionController.searchActas);
router.get('/proyecto/:proyectoId', actaReunionController.getActasByProject);
router.post('/', actaReunionController.createActa);
router.get('/:id', actaReunionController.getActaById);
router.put('/:id', actaReunionController.updateActa);
router.delete('/:id', actaReunionController.deleteActa);

module.exports = router;
