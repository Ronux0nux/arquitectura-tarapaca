const express = require('express');
const router = express.Router();
const insumoController = require('../controllers/insumoController');

router.get('/', insumoController.getInsumos);
router.post('/', insumoController.createInsumo);
router.get('/:id', insumoController.getInsumoById);
router.put('/:id', insumoController.updateInsumo);
router.delete('/:id', insumoController.deleteInsumo);

module.exports = router;
