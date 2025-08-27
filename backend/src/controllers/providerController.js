const Provider = require('../models/Provider');

// Obtener todos los proveedores
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.findAll();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear proveedor nuevo
exports.createProvider = async (req, res) => {
  try {
    const result = await Provider.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Obtener proveedor por ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar proveedor
exports.updateProvider = async (req, res) => {
  try {
    const updated = await Provider.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar proveedor
exports.deleteProvider = async (req, res) => {
  try {
    await Provider.delete(req.params.id);
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
