const Provider = require('../models/Provider');

// Obtener todos los proveedores
exports.getProviders = (req, res) => {
  try {
    const providers = Provider.findAll();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear proveedor nuevo
exports.createProvider = (req, res) => {
  try {
    const result = Provider.create(req.body);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener proveedor por ID
exports.getProviderById = (req, res) => {
  try {
    const provider = Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar proveedor
exports.updateProvider = (req, res) => {
  try {
    const stmt = Provider.db.prepare(`UPDATE providers SET nombre = ?, rut = ?, direccion = ?, telefono = ?, email = ?, sitioWeb = ?, rubros = ? WHERE id = ?`);
    stmt.run(req.body.nombre, req.body.rut, req.body.direccion, req.body.telefono, req.body.email, req.body.sitioWeb, JSON.stringify(req.body.rubros || []), req.params.id);
    const updated = Provider.findById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar proveedor
exports.deleteProvider = (req, res) => {
  try {
    const stmt = Provider.db.prepare(`DELETE FROM providers WHERE id = ?`);
    stmt.run(req.params.id);
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
