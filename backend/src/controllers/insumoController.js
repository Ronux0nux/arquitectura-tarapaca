const Insumo = require('../models/Insumo');

exports.getInsumos = async (req, res) => {
  try {
    const insumos = await Insumo.find().populate('proveedorId');
    res.json(insumos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createInsumo = async (req, res) => {
  try {
    const { nombre, unidad, precioActual, proveedorId } = req.body;
    const newInsumo = new Insumo({ nombre, unidad, precioActual, proveedorId });
    await newInsumo.save();
    res.status(201).json(newInsumo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getInsumoById = async (req, res) => {
  try {
    const insumo = await Insumo.findById(req.params.id).populate('proveedorId');
    if (!insumo) return res.status(404).json({ error: 'Insumo no encontrado' });
    res.json(insumo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInsumo = async (req, res) => {
  try {
    const updatedInsumo = await Insumo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedInsumo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInsumo = async (req, res) => {
  try {
    await Insumo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Insumo eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
