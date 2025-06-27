const Provider = require('../models/Provider');

// Obtener todos los proveedores
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear proveedor nuevo
exports.createProvider = async (req, res) => {
  try {
    const { nombre, contacto, historialPrecios } = req.body;
    const newProvider = new Provider({ nombre, contacto, historialPrecios });
    await newProvider.save();
    res.status(201).json(newProvider);
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
    const updatedProvider = await Provider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProvider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar proveedor
exports.deleteProvider = async (req, res) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proveedor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
