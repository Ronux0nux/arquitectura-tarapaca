const Insumo = require('../models/Insumo');

exports.getInsumos = (req, res) => {
  try {
    const insumos = Insumo.findAll();
    res.json(insumos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createInsumo = (req, res) => {
  try {
    const result = Insumo.create(req.body);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getInsumoById = (req, res) => {
  try {
    const insumo = Insumo.findById(req.params.id);
    if (!insumo) return res.status(404).json({ error: 'Insumo no encontrado' });
    res.json(insumo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateInsumo = (req, res) => {
  try {
    const stmt = Insumo.db.prepare(`UPDATE insumos SET nombre = ?, unidad = ?, precioActual = ?, precioReferencia = ?, proveedorId = ? WHERE id = ?`);
    stmt.run(req.body.nombre, req.body.unidad, req.body.precioActual, req.body.precioReferencia, req.body.proveedorId, req.params.id);
    const updated = Insumo.findById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInsumo = (req, res) => {
  try {
    const stmt = Insumo.db.prepare(`DELETE FROM insumos WHERE id = ?`);
    stmt.run(req.params.id);
    res.json({ message: 'Insumo eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
