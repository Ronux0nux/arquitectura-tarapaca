const Project = require('../models/Project');

// Obtener todos los proyectos
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('equipo').populate('partidasApu.insumos.insumoId');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nuevo proyecto
exports.createProject = async (req, res) => {
  try {
    const nuevoProyecto = new Project(req.body);
    await nuevoProyecto.save();
    res.status(201).json(nuevoProyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Obtener un proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('equipo').populate('partidasApu.insumos.insumoId');
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar proyecto
exports.updateProject = async (req, res) => {
  try {
    const actualizado = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar proyecto
exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Proyecto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};