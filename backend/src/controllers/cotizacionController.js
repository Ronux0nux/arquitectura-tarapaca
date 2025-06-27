const Cotizacion = require('../models/Cotizacion');

exports.getCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await Cotizacion.find()
      .populate('proyectoId')
      .populate('proveedorId');
    res.json(cotizaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCotizacion = async (req, res) => {
  try {
    const { proyectoId, partidaId, proveedorId, precioUnitario, detalles } = req.body;
    const newCotizacion = new Cotizacion({
      proyectoId, partidaId, proveedorId, precioUnitario, detalles
    });
    await newCotizacion.save();
    res.status(201).json(newCotizacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCotizacionById = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('proyectoId')
      .populate('proveedorId');
    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(cotizacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCotizacion = async (req, res) => {
  try {
    const updatedCotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedCotizacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCotizacion = async (req, res) => {
  try {
    await Cotizacion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cotización eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
