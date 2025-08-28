import React, { useState, useEffect } from 'react';

// ...existing code...

const Projects = () => {
  // URL base del API - ajustar según el entorno
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActasModal, setShowActasModal] = useState(false);
  const [showActaDetailsModal, setShowActaDetailsModal] = useState(false);
  const [showMaterialesModal, setShowMaterialesModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditingInDetails, setIsEditingInDetails] = useState(false);
  const [detailsProjectEdit, setDetailsProjectEdit] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [selectedActa, setSelectedActa] = useState(null);
  const [actas, setActas] = useState([]);
  const [loadingActas, setLoadingActas] = useState(false);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [supervisores, setSupervisores] = useState([]);
  const [loadingSupervisores, setLoadingSupervisores] = useState(false);
  
  // Simulando rol del usuario (en producción vendría del contexto de autenticación)
  const [userRole, setUserRole] = useState('supervisor'); // 'supervisor', 'administrador', 'usuario'
  
  // Estados para búsqueda avanzada
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    nombre: '',
    codigo: '',
    fechaInicio: '',
    fechaTermino: '',
    estado: ''
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

  const estados = ['Planificación', 'Cotización', 'Pendiente de Aprobación', 'En Ejecución', 'Finalizado'];

  // Cargar proyectos
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/projects`);
      const data = await response.json();
      
      console.log('📋 Proyectos cargados desde el backend:', data);
      if (data && data.length > 0) {
        console.log('📋 Primer proyecto como ejemplo:', data[0]);
        console.log('📋 Subencargado del primer proyecto:', data[0].subencargado);
        console.log('📋 IDs de todos los proyectos:', data.map(p => p.id));
        const sinId = data.filter(p => !p.id);
        if (sinId.length > 0) {
          console.warn('⚠️ Proyectos sin id:', sinId);
        }
      }
      
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
      if (searchFilters.estado) queryParams.append('estado', searchFilters.estado);

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
      console.log('🆕 Creando nuevo proyecto:', newProject);
      
      // Validar que los campos requeridos estén presentes
      if (!newProject.nombre || !newProject.codigo || !newProject.fechaInicio || !newProject.fechaTermino || !newProject.subencargado) {
        alert('Por favor complete todos los campos requeridos (nombre, código, fechas y coordinador)');
        return;
      }

      console.log('🆕 Supervisor seleccionado:', newProject.subencargado);
      console.log('🆕 Lista de supervisores disponibles:', supervisores);

      // Crear proyecto con el ID del supervisor seleccionado
      const projectData = {
        ...newProject,
        // El subencargado debe ser un ObjectId válido
        subencargado: newProject.subencargado
      };

      console.log('🆕 Datos finales a enviar:', projectData);

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      console.log('🆕 Respuesta del servidor:', result);

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
        console.log('🆕 Proyecto creado exitosamente, recargando lista...');
        await fetchProjects();
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

  // Editar proyecto existente en el sistema
  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      console.log('💾 Guardando proyecto editado:', projectToEdit);
      console.log('💾 Subencargado a enviar:', projectToEdit.subencargado);
      
      // Validar que los campos requeridos estén presentes
      if (!projectToEdit.nombre || !projectToEdit.codigo || !projectToEdit.fechaInicio || !projectToEdit.fechaTermino || !projectToEdit.subencargado) {
        alert('Por favor complete todos los campos requeridos (nombre, código, fechas y coordinador)');
        return;
      }

      const projectData = {
        ...projectToEdit,
        // El subencargado debe ser un ObjectId válido
        subencargado: projectToEdit.subencargado
      };

      console.log('💾 Datos finales a enviar:', projectData);

  const response = await fetch(`${API_BASE_URL}/projects/${projectToEdit.id || projectToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      console.log('💾 Respuesta del servidor:', result);

      if (response.ok) {
        setShowEditModal(false);
        setProjectToEdit(null);
        fetchProjects();
        alert('Proyecto actualizado exitosamente');
      } else {
        console.error('Error del servidor:', result);
        alert(`Error al actualizar el proyecto: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      alert(`Error al actualizar el proyecto: ${error.message}`);
    }
  };

    // Función para crear acta

    // Estado para nueva acta
    const [newActa, setNewActa] = useState({
      entidad: '',
      fecha: '',
      lugar: '',
      horaInicio: '',
      horaTermino: '',
      objetivo: '',
      temasTratados: '',
      acuerdos: '',
      asistencia: [],
      creadoPor: '',
    });

    // Estado para edición de acta
    const [editActa, setEditActa] = useState(null);

    // Modal para crear acta
    const [showCreateActaModal, setShowCreateActaModal] = useState(false);
    // Modal para editar acta
    const [showEditActaModal, setShowEditActaModal] = useState(false);

    // Abrir modal de creación
    const handleCreateActa = () => {
      setNewActa({
        entidad: '',
        fecha: '',
        lugar: '',
        horaInicio: '',
        horaTermino: '',
        objetivo: '',
        temasTratados: '',
        acuerdos: '',
        asistencia: [],
        creadoPor: userRole,
      });
      setShowCreateActaModal(true);
    };

    // Abrir modal de edición

    // Guardar nueva acta
    const saveNewActa = async () => {
      if (!selectedProject) return;
      try {
        const payload = {
          ...newActa,
          proyectoId: selectedProject._id,
          creadoPor: userRole,
        };
        const response = await fetch(`${API_BASE_URL}/actas-reunion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          setShowCreateActaModal(false);
          fetchActasForProject(selectedProject._id);
          alert('Acta creada exitosamente');
        } else {
          alert('Error al crear acta');
        }
      } catch (error) {
        alert('Error al crear acta: ' + error.message);
      }
    };

    // Guardar edición de acta
    const saveEditActa = async () => {
      if (!selectedProject || !editActa) return;
      try {
        const payload = {
          ...editActa,
          proyectoId: selectedProject._id,
        };
        const response = await fetch(`${API_BASE_URL}/actas-reunion/${editActa._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          setShowEditActaModal(false);
          fetchActasForProject(selectedProject._id);
          alert('Acta actualizada exitosamente');
        } else {
          alert('Error al actualizar acta');
        }
      } catch (error) {
        alert('Error al actualizar acta: ' + error.message);
      }
    };

    // Función para editar acta
    const handleEditActa = (acta) => {
      // TODO: Implementar lógica para editar acta
      alert('Función para editar acta no implementada');
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

  // Cargar cotizaciones/materiales de un proyecto
  const fetchCotizacionesForProject = async (projectId) => {
    try {
      setLoadingCotizaciones(true);
      const response = await fetch(`${API_BASE_URL}/cotizaciones/project/${projectId}`);
      const data = await response.json();
      setCotizaciones(data.cotizaciones || []);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      setCotizaciones([]);
    } finally {
      setLoadingCotizaciones(false);
    }
  };

  // Cargar supervisores del sistema
  const fetchSupervisores = async () => {
    try {
      console.log('👥 Cargando supervisores desde:', `${API_BASE_URL}/users/supervisores`);
      setLoadingSupervisores(true);
      const response = await fetch(`${API_BASE_URL}/users/supervisores`);
      console.log('👥 Respuesta del servidor:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('👥 Supervisores recibidos:', data);
        setSupervisores(data || []);
      } else {
        console.log('👥 Endpoint no disponible, usando datos de ejemplo');
        // Si no existe el endpoint, usar datos de ejemplo con ObjectIds válidos
        setSupervisores([
          { _id: '507f1f77bcf86cd799439011', nombre: 'Mónica Rodríguez', email: 'monica.rodriguez@aceleratarapaka.cl', rol: 'supervisor' },
          { _id: '507f1f77bcf86cd799439012', nombre: 'Cecilia García', email: 'cecilia.garcia@aceleratarapaka.cl', rol: 'supervisor' },
          { _id: '507f1f77bcf86cd799439013', nombre: 'Carlos Marcoleta', email: 'carlos.marcoleta@aceleratarapaka.cl', rol: 'administrador' },
          { _id: '507f1f77bcf86cd799439014', nombre: 'José Miguel Astudillo', email: 'jose.astudillo@aceleratarapaka.cl', rol: 'coordinador de especialidades' }
        ]);
      }
    } catch (error) {
      console.error('Error al cargar supervisores:', error);
      // Datos de ejemplo en caso de error con ObjectIds válidos
      setSupervisores([
        { _id: '507f1f77bcf86cd799439011', nombre: 'Mónica Rodríguez', email: 'monica.rodriguez@aceleratarapaka.cl', rol: 'supervisor' },
        { _id: '507f1f77bcf86cd799439012', nombre: 'Cecilia García', email: 'cecilia.garcia@aceleratarapaka.cl', rol: 'supervisor' },
        { _id: '507f1f77bcf86cd799439013', nombre: 'Carlos Marcoleta', email: 'carlos.marcoleta@aceleratarapaka.cl', rol: 'administrador' },
        { _id: '507f1f77bcf86cd799439014', nombre: 'José Miguel Astudillo', email: 'jose.astudillo@aceleratarapaka.cl', rol: 'coordinador de especialidades' }
      ]);
    } finally {
      setLoadingSupervisores(false);
    }
  };

  // Obtener nombre del supervisor por ID
  const getSupervisorName = (supervisorData) => {
    console.log('👤 getSupervisorName recibió:', supervisorData);
    
    if (!supervisorData) return 'No asignado';
    
    // Si supervisorData es un objeto (populado), usar su información directamente
    if (typeof supervisorData === 'object' && supervisorData.nombre) {
      return `${supervisorData.nombre} (${supervisorData.rol})`;
    }
    
    // Si supervisorData es un string (ObjectId), buscar en la lista de supervisores
    const supervisorId = typeof supervisorData === 'string' ? supervisorData : supervisorData._id;
    const supervisor = supervisores.find(sup => sup._id === supervisorId);
    
    if (supervisor) {
      return `${supervisor.nombre} (${supervisor.rol})`;
    }
    
    // Si no se encuentra, devolver el ID
    return supervisorId || 'No asignado';
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
      fechaTermino: '',
      estado: ''
    });
  };

  // Contar filtros activos
  const getActiveFiltersCount = () => {
    const activeFilters = Object.values(searchFilters).filter(value => value !== '');
    return activeFilters.length;
  };

  // Ver detalles del proyecto
  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setIsEditingInDetails(false);
    setDetailsProjectEdit(null);
    setShowDetailsModal(true);
  };

  // Activar modo edición en detalles
  const handleStartEditingInDetails = () => {
    console.log('🔧 Iniciando edición en detalles para proyecto:', selectedProject);
    console.log('🔧 Subencargado actual:', selectedProject.subencargado);
    
    // Extraer el ObjectId del subencargado si es un objeto
    const subencargadoId = selectedProject.subencargado?._id || selectedProject.subencargado || '';
    console.log('🔧 Subencargado ID extraído:', subencargadoId);
    
    setDetailsProjectEdit({
      ...selectedProject,
      fechaInicio: selectedProject.fechaInicio ? new Date(selectedProject.fechaInicio).toISOString().split('T')[0] : '',
      fechaTermino: selectedProject.fechaTermino ? new Date(selectedProject.fechaTermino).toISOString().split('T')[0] : '',
      subencargado: subencargadoId // Asegurar que sea el ObjectId
    });
    setIsEditingInDetails(true);
  };

  // Cancelar edición en detalles
  const handleCancelEditingInDetails = () => {
    setIsEditingInDetails(false);
    setDetailsProjectEdit(null);
  };

  // Guardar cambios desde detalles
  const handleSaveFromDetails = async () => {
    try {
      console.log('💾 Guardando cambios desde detalles:', detailsProjectEdit);
      console.log('💾 Subencargado a enviar:', detailsProjectEdit.subencargado);
      
      // Validar que los campos requeridos estén presentes
      if (!detailsProjectEdit.nombre || !detailsProjectEdit.codigo || !detailsProjectEdit.fechaInicio || !detailsProjectEdit.fechaTermino || !detailsProjectEdit.subencargado) {
        alert('Por favor complete todos los campos requeridos (nombre, código, fechas y coordinador)');
        return;
      }

      const projectData = {
        ...detailsProjectEdit,
        // El subencargado debe ser un ObjectId válido
        subencargado: detailsProjectEdit.subencargado
      };

      console.log('💾 Datos finales a enviar:', projectData);

      const response = await fetch(`${API_BASE_URL}/projects/${detailsProjectEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      console.log('💾 Respuesta del servidor:', result);

      if (response.ok) {
        // Actualizar el proyecto seleccionado
        setSelectedProject(detailsProjectEdit);
        setIsEditingInDetails(false);
        setDetailsProjectEdit(null);
        fetchProjects(); // Recargar la lista
        alert('Proyecto actualizado exitosamente');
      } else {
        console.error('Error del servidor:', result);
        alert(`Error al actualizar el proyecto: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      alert(`Error al actualizar el proyecto: ${error.message}`);
    }
  };

  // Editar proyecto (solo para supervisores y administradores)
  const handleOpenEditModal = (project) => {
    console.log('🔧 Abriendo modal de edición para proyecto:', project);
    console.log('🔧 Subencargado actual:', project.subencargado);
    
    // Extraer el ObjectId del subencargado si es un objeto
    const subencargadoId = project.subencargado?._id || project.subencargado || '';
    console.log('🔧 Subencargado ID extraído:', subencargadoId);
    
    setProjectToEdit({
      ...project,
      fechaInicio: project.fechaInicio ? new Date(project.fechaInicio).toISOString().split('T')[0] : '',
      fechaTermino: project.fechaTermino ? new Date(project.fechaTermino).toISOString().split('T')[0] : '',
      subencargado: subencargadoId // Asegurar que sea el ObjectId
    });
    setShowEditModal(true);
  };

  // Verificar si el usuario puede editar proyectos
  const canEditProjects = () => {
    return userRole === 'supervisor' || userRole === 'administrador';
  };

  // Ver actas del proyecto
  const handleViewActas = (project) => {
    setSelectedProject(project);
    setShowActasModal(true);
    fetchActasForProject(project._id);
  };

  // Ver materiales cotizados del proyecto
  const handleViewMateriales = (project) => {
    setSelectedProject(project);
    setShowMaterialesModal(true);
    fetchCotizacionesForProject(project._id);
  };

  // Ver detalles de un acta específica
  const handleViewActaDetails = (acta) => {
    setSelectedActa(acta);
    setShowActaDetailsModal(true);
  };

  useEffect(() => {
    fetchProjects();
    fetchSupervisores();
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Proyectos</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-600">Rol actual:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="usuario">Usuario</option>
              <option value="supervisor">Supervisor</option>
              <option value="administrador">Administrador</option>
            </select>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              userRole === 'administrador' ? 'bg-red-100 text-red-800' :
              userRole === 'supervisor' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </div>
        </div>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Filtros de Búsqueda</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors relative"
          >
            <svg 
              className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>
        </div>

        {/* Filtro de Estado siempre visible */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Proyecto</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('estado', '')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                searchFilters.estado === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {estados.map((estado) => (
              <button
                key={estado}
                onClick={() => handleFilterChange('estado', estado)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchFilters.estado === estado 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros avanzados colapsables */}
        {showFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        )}

        <div className="mt-4 flex gap-2 items-center justify-between">
          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Limpiar Filtros
          </button>
          {getActiveFiltersCount() > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{getActiveFiltersCount()}</span> filtro{getActiveFiltersCount() > 1 ? 's' : ''} activo{getActiveFiltersCount() > 1 ? 's' : ''}
            </div>
          )}
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
                        {getSupervisorName(project.subencargado)}
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
                          onClick={() => handleViewMateriales(project)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Materiales
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleViewActas(project)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          Actas
                        </button>
                        {canEditProjects() && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleOpenEditModal(project)}
                              className="text-orange-600 hover:text-orange-900 font-medium"
                              title="Editar proyecto (Solo supervisores y administradores)"
                            >
                              ✏️ Editar
                            </button>
                          </>
                        )}
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
                <select
                  value={newProject.subencargado}
                  onChange={(e) => setNewProject({...newProject, subencargado: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar coordinador...</option>
                  {supervisores.map(supervisor => (
                    <option key={supervisor._id} value={supervisor._id}>
                      {supervisor.nombre} - {supervisor.rol}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seleccione un supervisor o administrador del sistema
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

      {/* Modal para editar proyecto */}
      {showEditModal && projectToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Editar Proyecto</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  value={projectToEdit.nombre}
                  onChange={(e) => setProjectToEdit({...projectToEdit, nombre: e.target.value})}
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
                  value={projectToEdit.codigo}
                  onChange={(e) => setProjectToEdit({...projectToEdit, codigo: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Código único del proyecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={projectToEdit.descripcion}
                  onChange={(e) => setProjectToEdit({...projectToEdit, descripcion: e.target.value})}
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
                  value={projectToEdit.ubicacion}
                  onChange={(e) => setProjectToEdit({...projectToEdit, ubicacion: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ubicación del proyecto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    required
                    value={projectToEdit.fechaInicio}
                    onChange={(e) => setProjectToEdit({...projectToEdit, fechaInicio: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Término *
                  </label>
                  <input
                    type="date"
                    required
                    value={projectToEdit.fechaTermino}
                    onChange={(e) => setProjectToEdit({...projectToEdit, fechaTermino: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  required
                  value={projectToEdit.estado}
                  onChange={(e) => setProjectToEdit({...projectToEdit, estado: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordinador Encargado *
                </label>
                <select
                  value={projectToEdit.subencargado}
                  onChange={(e) => setProjectToEdit({...projectToEdit, subencargado: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar coordinador...</option>
                  {supervisores.map(supervisor => (
                    <option key={supervisor._id} value={supervisor._id}>
                      {supervisor.nombre} - {supervisor.rol}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seleccione un supervisor o administrador del sistema
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">⚠️ Privilegios de Edición</h4>
                <p className="text-xs text-blue-700">
                  Como <strong>{userRole}</strong>, puedes editar todos los campos del proyecto. 
                  Los cambios se aplicarán inmediatamente y afectarán todos los módulos relacionados.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  ✏️ Actualizar Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para detalles del proyecto */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  {isEditingInDetails ? 'Editar Proyecto' : 'Detalles del Proyecto'}
                </h2>
                <div className="flex items-center gap-2">
                  {/* Botón de cierre (X) */}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none absolute top-4 right-4"
                    title="Cerrar"
                  >
                    &times;
                  </button>
                  {/* Botón editar, más a la izquierda */}
                  {!isEditingInDetails && canEditProjects() && (
                    <button
                      onClick={handleStartEditingInDetails}
                      className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm absolute top-4 right-16"
                      title="Editar proyecto"
                    >
                      ✏️ Editar
                    </button>
                  )}
                </div>
              </div>
            
            {isEditingInDetails && detailsProjectEdit ? (
              // Modo edición
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Proyecto *
                    </label>
                    <input
                      type="text"
                      required
                      value={detailsProjectEdit.nombre}
                      onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, nombre: e.target.value})}
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
                      value={detailsProjectEdit.codigo}
                      onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, codigo: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Código único del proyecto"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={detailsProjectEdit.descripcion}
                    onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, descripcion: e.target.value})}
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
                    value={detailsProjectEdit.ubicacion}
                    onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, ubicacion: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ubicación del proyecto"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      required
                      value={detailsProjectEdit.fechaInicio}
                      onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, fechaInicio: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Término *
                    </label>
                    <input
                      type="date"
                      required
                      value={detailsProjectEdit.fechaTermino}
                      onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, fechaTermino: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    required
                    value={detailsProjectEdit.estado}
                    onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, estado: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {estados.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coordinador Encargado *
                  </label>
                  <select
                    value={detailsProjectEdit.subencargado}
                    onChange={(e) => setDetailsProjectEdit({...detailsProjectEdit, subencargado: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar coordinador...</option>
                    {supervisores.map(supervisor => (
                      <option key={supervisor._id} value={supervisor._id}>
                        {supervisor.nombre} - {supervisor.rol}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Seleccione un supervisor o administrador del sistema
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">⚠️ Modo Edición Activo</h4>
                  <p className="text-xs text-blue-700">
                    Como <strong>{userRole}</strong>, estás editando los detalles del proyecto. 
                    Los cambios se aplicarán inmediatamente al guardar.
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={handleCancelEditingInDetails}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveFromDetails}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <>
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
                      <p className="text-gray-900">{getSupervisorName(selectedProject.subencargado)}</p>
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
              </>
            )}
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
                <button
                  onClick={handleCreateActa}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Crear nueva acta
                </button>
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
                      <button
                        onClick={() => handleEditActa(acta)}
                        className="ml-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Editar
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

      {/* Modal para materiales cotizados del proyecto */}
      {showMaterialesModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Materiales Cotizados - {selectedProject.nombre}
              </h2>
              <button 
                onClick={() => setShowMaterialesModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {loadingCotizaciones ? (
              <div className="text-center py-8">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
                <p className="mt-2">Cargando cotizaciones...</p>
              </div>
            ) : cotizaciones.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay materiales cotizados</h3>
                <p>Este proyecto aún no tiene materiales cotizados para proceso de aprobación.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Total de cotizaciones: <span className="font-semibold">{cotizaciones.length}</span>
                  </p>
                  <div className="text-sm text-gray-500">
                    <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1"></span> En proceso
                    <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1 ml-4"></span> Aprobado
                    <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-1 ml-4"></span> Rechazado
                  </div>
                </div>
                
                {cotizaciones.map((cotizacion) => (
                  <div key={cotizacion._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Cotización #{cotizacion.numero || cotizacion._id.slice(-6)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cotizacion.estado === 'aprobado' 
                              ? 'bg-green-100 text-green-800' 
                              : cotizacion.estado === 'rechazado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cotizacion.estado === 'aprobado' ? 'Aprobado' : 
                             cotizacion.estado === 'rechazado' ? 'Rechazado' : 'En Proceso'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Proveedor:</span>
                            <p>{cotizacion.proveedor?.nombre || 'No asignado'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Fecha solicitud:</span>
                            <p>{cotizacion.fechaSolicitud ? new Date(cotizacion.fechaSolicitud).toLocaleDateString() : 'No definida'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Fecha vencimiento:</span>
                            <p>{cotizacion.fechaVencimiento ? new Date(cotizacion.fechaVencimiento).toLocaleDateString() : 'No definida'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Total estimado:</span>
                            <p className="font-semibold text-green-600">
                              ${cotizacion.precioTotal?.toLocaleString() || 'Por calcular'}
                            </p>
                          </div>
                        </div>
                        
                        {cotizacion.items && cotizacion.items.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-sm text-gray-700">Materiales incluidos:</span>
                            <div className="mt-2 bg-gray-50 p-3 rounded">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {cotizacion.items.slice(0, 4).map((item, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{item.cantidad}x</span> {item.descripcion}
                                    <span className="text-green-600 ml-2">${item.precioUnitario?.toLocaleString()}</span>
                                  </div>
                                ))}
                                {cotizacion.items.length > 4 && (
                                  <div className="text-sm text-gray-500 italic">
                                    +{cotizacion.items.length - 4} materiales más...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {cotizacion.observaciones && (
                          <div className="mt-3">
                            <span className="font-medium text-sm text-gray-700">Observaciones:</span>
                            <p className="text-gray-700 text-sm mt-1">{cotizacion.observaciones}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                          onClick={() => {
                            // Aquí podrías agregar funcionalidad para ver detalles completos
                            console.log('Ver detalles de cotización:', cotizacion);
                          }}
                        >
                          Ver Detalles
                        </button>
                        {cotizacion.estado === 'pendiente' && (
                          <div className="flex flex-col gap-1">
                            <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs">
                              Aprobar
                            </button>
                            <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs">
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
