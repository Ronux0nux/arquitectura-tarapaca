const Insumo = require('../models/Insumo');

exports.createInsumo = async (req, res) => {
  try {
    const result = await Insumo.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getInsumos = async (req, res) => {
  try {
    const insumos = await Insumo.findAll();
    res.json(insumos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInsumoById = async (req, res) => {
  try {
    const insumo = await Insumo.findById(req.params.id);
    if (!insumo) return res.status(404).json({ error: 'Insumo no encontrado' });
    res.json(insumo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInsumo = async (req, res) => {
  try {
    const updated = await Insumo.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInsumo = async (req, res) => {
  try {
    await Insumo.delete(req.params.id);
    res.json({ message: 'Insumo eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
