import React, { useState, useEffect } from 'react';

const Projects = () => {
  // URL base del API - ajustar según el entorno
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActasModal, setShowActasModal] = useState(false);
  const [showActaDetailsModal, setShowActaDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedActa, setSelectedActa] = useState(null);
  const [actas, setActas] = useState([]);
  const [loadingActas, setLoadingActas] = useState(false);
  
  // Estados para búsqueda avanzada
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    nombre: '',
    codigo: '',
    fechaInicio: '',
    fechaTermino: ''
  });

  // Estados para crear proyecto
  const [newProject, setNewProject] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    ubicacion: '',
    fechaInicio: '',
    fechaTermino: '',
    estado: 'Planificación',
    subencargado: ''
  });

  const estados = ['Planificación', 'En ejecución', 'Finalizado'];

  // Cargar proyectos
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/projects`);
      const data = await response.json();
      // El backend devuelve directamente el array de proyectos
      setProjects(data || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda avanzada de proyectos
  const searchProjects = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchFilters.id) queryParams.append('id', searchFilters.id);
      if (searchFilters.nombre) queryParams.append('nombre', searchFilters.nombre);
      if (searchFilters.codigo) queryParams.append('codigo', searchFilters.codigo);
      if (searchFilters.fechaInicio) queryParams.append('fechaInicio', searchFilters.fechaInicio);
      if (searchFilters.fechaTermino) queryParams.append('fechaTermino', searchFilters.fechaTermino);

      const url = queryParams.toString() 
        ? `${API_BASE_URL}/projects/search?${queryParams}`
        : `${API_BASE_URL}/projects`;

      const response = await fetch(url);
      const data = await response.json();
      // El backend devuelve directamente el array de proyectos
      setProjects(data || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo proyecto
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      // Validar que los campos requeridos estén presentes
      if (!newProject.nombre || !newProject.codigo || !newProject.fechaInicio || !newProject.fechaTermino) {
        alert('Por favor complete todos los campos requeridos (nombre, código, fechas)');
        return;
      }

      // Crear un ObjectId temporal para el subencargado si no está vacío
      const projectData = {
        ...newProject,
        // Si subencargado está vacío, usar un ObjectId temporal válido
        subencargado: newProject.subencargado || '507f1f77bcf86cd799439011'
      };

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setNewProject({
          nombre: '',
          codigo: '',
          descripcion: '',
          ubicacion: '',
          fechaInicio: '',
          fechaTermino: '',
          estado: 'Planificación',
          subencargado: ''
        });
        fetchProjects();
        alert('Proyecto creado exitosamente');
      } else {
        console.error('Error del servidor:', result);
        alert(`Error al crear el proyecto: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      alert(`Error al crear el proyecto: ${error.message}`);
    }
  };

  // Cargar actas de un proyecto
  const fetchActasForProject = async (projectId) => {
    try {
      setLoadingActas(true);
      const response = await fetch(`${API_BASE_URL}/actas-reunion/project/${projectId}`);
      const data = await response.json();
      setActas(data.actas || []);
    } catch (error) {
      console.error('Error al cargar actas:', error);
      setActas([]);
    } finally {
      setLoadingActas(false);
    }
  };

  // Manejar filtros de búsqueda
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchFilters({
      id: '',
      nombre: '',
      codigo: '',
      fechaInicio: '',
      fechaTermino: ''
    });
  };

  // Ver detalles del proyecto
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  // Ver actas del proyecto
  const handleViewActas = (project) => {
    setSelectedProject(project);
    setShowActasModal(true);
    fetchActasForProject(project._id);
  };

  // Ver detalles de un acta específica
  const handleViewActaDetails = (acta) => {
    setSelectedActa(acta);
    setShowActaDetailsModal(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Búsqueda automática cuando cambian los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProjects();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchFilters]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Proyectos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          Nuevo Proyecto
        </button>
      </div>

      {/* Barra de búsqueda avanzada */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Búsqueda Avanzada</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              placeholder="Buscar por ID"
              value={searchFilters.id}
              onChange={(e) => handleFilterChange('id', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={searchFilters.nombre}
              onChange={(e) => handleFilterChange('nombre', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              type="text"
              placeholder="Buscar por código"
              value={searchFilters.codigo}
              onChange={(e) => handleFilterChange('codigo', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={searchFilters.fechaInicio}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Término</label>
            <input
              type="date"
              value={searchFilters.fechaTermino}
              onChange={(e) => handleFilterChange('fechaTermino', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-4">
        <p className="text-gray-600">
          Se encontraron <span className="font-semibold">{projects.length}</span> proyecto(s)
        </p>
      </div>

      {/* Tabla de proyectos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando proyectos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Término
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p>No se encontraron proyectos</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.estado === 'Finalizado' ? 'bg-green-100 text-green-800' :
                          project.estado === 'En ejecución' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.fechaInicio ? new Date(project.fechaInicio).toLocaleDateString() : 'No definida'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.fechaTermino ? new Date(project.fechaTermino).toLocaleDateString() : 'No definida'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.subencargado || 'No asignado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetails(project)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Ver más
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleViewActas(project)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Actas
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear proyecto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Crear Nuevo Proyecto</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  value={newProject.nombre}
                  onChange={(e) => setNewProject({...newProject, nombre: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese el nombre del proyecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  value={newProject.codigo}
                  onChange={(e) => setNewProject({...newProject, codigo: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Código único del proyecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newProject.descripcion}
                  onChange={(e) => setNewProject({...newProject, descripcion: e.target.value})}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción del proyecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={newProject.ubicacion}
                  onChange={(e) => setNewProject({...newProject, ubicacion: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ubicación del proyecto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={newProject.fechaInicio}
                    onChange={(e) => setNewProject({...newProject, fechaInicio: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Término
                  </label>
                  <input
                    type="date"
                    value={newProject.fechaTermino}
                    onChange={(e) => setNewProject({...newProject, fechaTermino: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={newProject.estado}
                  onChange={(e) => setNewProject({...newProject, estado: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subencargado/Coordinador *
                </label>
                <input
                  type="text"
                  placeholder="ID del coordinador encargado (ObjectId)"
                  value={newProject.subencargado}
                  onChange={(e) => setNewProject({...newProject, subencargado: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingrese un ObjectId válido o déjelo vacío para usar uno temporal
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para detalles del proyecto */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Detalles del Proyecto</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">ID:</span>
                  <p className="text-gray-600 bg-gray-50 p-2 rounded text-sm">{selectedProject._id}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Nombre:</span>
                  <p className="text-gray-900">{selectedProject.nombre}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Código:</span>
                  <p className="text-gray-900">{selectedProject.codigo}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Estado:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProject.estado === 'Finalizado' ? 'bg-green-100 text-green-800' :
                    selectedProject.estado === 'En ejecución' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedProject.estado}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">Fecha de Inicio:</span>
                  <p className="text-gray-900">{selectedProject.fechaInicio ? new Date(selectedProject.fechaInicio).toLocaleDateString() : 'No definida'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Fecha de Término:</span>
                  <p className="text-gray-900">{selectedProject.fechaTermino ? new Date(selectedProject.fechaTermino).toLocaleDateString() : 'No definida'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Coordinador Encargado:</span>
                  <p className="text-gray-900">{selectedProject.subencargado || 'No asignado'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Ubicación:</span>
                  <p className="text-gray-900">{selectedProject.ubicacion || 'No especificada'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <span className="font-semibold text-gray-700">Descripción:</span>
              <p className="mt-2 text-gray-700 bg-gray-50 p-4 rounded">
                {selectedProject.descripcion || 'No hay descripción disponible'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal para actas del proyecto */}
      {showActasModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Actas de Reunión - {selectedProject.nombre}
              </h2>
              <button 
                onClick={() => setShowActasModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {loadingActas ? (
              <div className="text-center py-8">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
                <p className="mt-2">Cargando actas...</p>
              </div>
            ) : actas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actas de reunión</h3>
                <p>Este proyecto aún no tiene actas de reunión registradas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <p className="text-gray-600">
                    Total de actas: <span className="font-semibold">{actas.length}</span>
                  </p>
                </div>
                
                {actas.map((acta) => (
                  <div key={acta._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{acta.entidad || acta.titulo}</h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Fecha:</span>
                            <p>{acta.fecha ? new Date(acta.fecha).toLocaleDateString() : 'No definida'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Hora inicio:</span>
                            <p>{acta.horaInicio || 'No definida'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Hora término:</span>
                            <p>{acta.horaTermino || 'No definida'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Creado por:</span>
                            <p>{acta.creadoPor || 'Usuario'}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="font-medium text-sm text-gray-700">Objetivo:</span>
                          <p className="text-gray-700 mt-1">{acta.objetivo || 'No especificado'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewActaDetails(acta)}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal para detalles de acta específica */}
      {showActaDetailsModal && selectedActa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Detalles del Acta de Reunión</h2>
              <button 
                onClick={() => setShowActaDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedActa.entidad || selectedActa.titulo}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-semibold text-gray-700">Fecha:</span>
                  <p className="text-gray-900">{selectedActa.fecha ? new Date(selectedActa.fecha).toLocaleDateString() : 'No definida'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-semibold text-gray-700">Hora de Inicio:</span>
                  <p className="text-gray-900">{selectedActa.horaInicio || 'No definida'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-semibold text-gray-700">Hora de Término:</span>
                  <p className="text-gray-900">{selectedActa.horaTermino || 'No definida'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-semibold text-gray-700">Creado por:</span>
                  <p className="text-gray-900">{selectedActa.creadoPor || 'Usuario'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded md:col-span-2">
                  <span className="font-semibold text-gray-700">Fecha de Creación:</span>
                  <p className="text-gray-900">{selectedActa.fechaCreacion ? new Date(selectedActa.fechaCreacion).toLocaleDateString() : 'No disponible'}</p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Objetivo de la Reunión:</span>
                <p className="mt-2 text-gray-700 bg-gray-50 p-4 rounded">
                  {selectedActa.objetivo || 'No especificado'}
                </p>
              </div>

              {selectedActa.temasTratados && selectedActa.temasTratados.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Temas Tratados:</span>
                  <ul className="mt-2 space-y-1">
                    {selectedActa.temasTratados.map((tema, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-gray-700">{tema}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedActa.acuerdos && selectedActa.acuerdos.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Acuerdos y Decisiones:</span>
                  <ul className="mt-2 space-y-1">
                    {selectedActa.acuerdos.map((acuerdo, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{acuerdo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedActa.descripcion && (
                <div>
                  <span className="font-semibold text-gray-700">Descripción Adicional:</span>
                  <p className="mt-2 text-gray-700 bg-gray-50 p-4 rounded">
                    {selectedActa.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
