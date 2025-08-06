import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import CotizacionService from '../services/CotizacionService';

export default function Presupuestos() {
  // URL base del API - sincronizada con Projects.jsx
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('descripcion');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  const { notifySuccess, notifyError } = useNotifications();

  // Cargar proyectos al inicializar
  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true);
        console.log('📊 Cargando proyectos para presupuestos...');
        
        // Usar la misma lógica que Projects.jsx
        const response = await fetch(`${API_BASE_URL}/projects`);
        const data = await response.json();
        
        if (response.ok && data) {
          // El backend devuelve directamente el array de proyectos
          const projectsWithCorrectFormat = data.map(project => ({
            id: project._id,
            name: project.nombre,
            code: project.codigo,
            description: project.descripcion,
            status: project.estado,
            budget: project.presupuesto || null,
            type: project.tipo || 'construcción'
          }));
          setProjects(projectsWithCorrectFormat);
          console.log(`✅ ${projectsWithCorrectFormat.length} proyectos cargados exitosamente:`, projectsWithCorrectFormat.map(p => ({ id: p.id, name: p.name, code: p.code })));
        } else {
          console.error('❌ Error en respuesta del servidor:', data);
          setProjects([]);
          notifyError('Error al cargar proyectos desde el servidor');
        }
      } catch (error) {
        console.error('❌ Error cargando proyectos:', error);
        setProjects([]);
        notifyError('Error de conexión al cargar proyectos');
      } finally {
        setLoading(false); 
      }
    };

    loadProjectsData();
  }, [notifyError]);

  // Cargar presupuesto cuando se selecciona un proyecto
  useEffect(() => {
    if (selectedProject) {
      const loadBudgetData = async () => {
        try {
          setLoading(true);
          console.log(`📋 Cargando presupuesto para proyecto: ${selectedProject.id}`);
          
          // Cargar cotizaciones del proyecto
          const cotizacionesResponse = await CotizacionService.getCotizacionesByProject(selectedProject.id);
          
          let budgetItems = [];
          
          if (cotizacionesResponse.success && cotizacionesResponse.cotizaciones) {
            // Procesar cotizaciones reales del proyecto
            budgetItems = cotizacionesResponse.cotizaciones.flatMap(cotizacion => 
              cotizacion.productos?.map(producto => ({
                id: `${cotizacion.id}_${producto.id || Math.random()}`,
                codigo: producto.codigo || 'N/A',
                descripcion: producto.nombre || producto.descripcion || 'Sin descripción',
                categoria: producto.categoria || 'Sin categoría',
                cantidad: producto.cantidad || 1,
                unidad: producto.unidad || 'un',
                precioUnitario: producto.precio || 0,
                precioTotal: (producto.cantidad || 1) * (producto.precio || 0),
                proveedor: cotizacion.proveedor?.nombre || 'Sin proveedor',
                proveedorContacto: cotizacion.proveedor?.contacto || '',
                fechaCotizacion: cotizacion.fecha || new Date().toISOString().split('T')[0],
                estado: cotizacion.estado || 'pendiente',
                observaciones: producto.observaciones || ''
              })) || []
            );
          }
          
          // Si no hay cotizaciones reales, generar datos de ejemplo
          if (budgetItems.length === 0) {
            budgetItems = generateSampleBudget(selectedProject.id);
          }
          
          setBudgetData(budgetItems);
          calculateStats(budgetItems);
          
          // Presupuesto cargado sin notificación automática
        } catch (error) {
          console.error('❌ Error cargando presupuesto:', error);
          
          // Generar datos de ejemplo en caso de error
          const sampleBudget = generateSampleBudget(selectedProject.id);
          setBudgetData(sampleBudget);
          calculateStats(sampleBudget);
          
          notifyError('Error cargando datos. Mostrando presupuesto de ejemplo');
        } finally {
          setLoading(false);
        }
      };

      loadBudgetData();
    }
  }, [selectedProject, notifyError]);

  // Generar presupuesto de ejemplo para demostración
  const generateSampleBudget = (projectId) => {
    const sampleItems = [
      {
        id: '1',
        codigo: 'CEM-001',
        descripcion: 'Cemento Portland Tipo I - 42.5kg',
        categoria: 'Materiales Base',
        cantidad: 100,
        unidad: 'sacos',
        precioUnitario: 8500,
        precioTotal: 850000,
        proveedor: 'Cementos Tarapacá',
        proveedorContacto: '+56 57 245-1000',
        fechaCotizacion: '2024-12-15',
        estado: 'aprobado',
        observaciones: 'Entrega en obra'
      },
      {
        id: '2',
        codigo: 'FIE-012',
        descripcion: 'Fierro Corrugado 12mm x 12m',
        categoria: 'Estructura',
        cantidad: 50,
        unidad: 'barras',
        precioUnitario: 15000,
        precioTotal: 750000,
        proveedor: 'Aceros del Norte',
        proveedorContacto: '+56 57 248-2000',
        fechaCotizacion: '2024-12-14',
        estado: 'aprobado',
        observaciones: 'Certificado de calidad incluido'
      },
      {
        id: '3',
        codigo: 'LAD-006',
        descripcion: 'Ladrillo Fiscal 29x14x7cm',
        categoria: 'Albañilería',
        cantidad: 2500,
        unidad: 'unidades',
        precioUnitario: 350,
        precioTotal: 875000,
        proveedor: 'Ladrillos Atacama',
        proveedorContacto: '+56 57 251-3000',
        fechaCotizacion: '2024-12-13',
        estado: 'pendiente',
        observaciones: 'Verificar calidad antes del despacho'
      },
      {
        id: '4',
        codigo: 'ARE-003',
        descripcion: 'Arena Gruesa m³',
        categoria: 'Áridos',
        cantidad: 20,
        unidad: 'm³',
        precioUnitario: 18000,
        precioTotal: 360000,
        proveedor: 'Áridos Pampa',
        proveedorContacto: '+56 57 247-4000',
        fechaCotizacion: '2024-12-12',
        estado: 'aprobado',
        observaciones: 'Material cribado'
      },
      {
        id: '5',
        codigo: 'GRA-002',
        descripcion: 'Gravilla 20mm m³',
        categoria: 'Áridos',
        cantidad: 15,
        unidad: 'm³',
        precioUnitario: 22000,
        precioTotal: 330000,
        proveedor: 'Áridos Pampa',
        proveedorContacto: '+56 57 247-4000',
        fechaCotizacion: '2024-12-12',
        estado: 'aprobado',
        observaciones: 'Tamaño uniforme'
      },
      {
        id: '6',
        codigo: 'TUB-050',
        descripcion: 'Tubería PVC 50mm x 6m',
        categoria: 'Instalaciones',
        cantidad: 25,
        unidad: 'tubos',
        precioUnitario: 12500,
        precioTotal: 312500,
        proveedor: 'Instalaciones Norte',
        proveedorContacto: '+56 57 252-5000',
        fechaCotizacion: '2024-12-11',
        estado: 'cotizado',
        observaciones: 'Incluye uniones'
      },
      {
        id: '7',
        codigo: 'PIN-001',
        descripcion: 'Pintura Látex Interior 4L',
        categoria: 'Terminaciones',
        cantidad: 30,
        unidad: 'galones',
        precioUnitario: 18500,
        precioTotal: 555000,
        proveedor: 'Pinturas del Desierto',
        proveedorContacto: '+56 57 249-6000',
        fechaCotizacion: '2024-12-10',
        estado: 'cotizado',
        observaciones: 'Color blanco hueso'
      },
      {
        id: '8',
        codigo: 'CER-025',
        descripcion: 'Cerámica Piso 30x30cm',
        categoria: 'Terminaciones',
        cantidad: 150,
        unidad: 'm²',
        precioUnitario: 8900,
        precioTotal: 1335000,
        proveedor: 'Cerámicas Tarapacá',
        proveedorContacto: '+56 57 250-7000',
        fechaCotizacion: '2024-12-09',
        estado: 'pendiente',
        observaciones: 'Primera calidad, antideslizante'
      }
    ];

    return sampleItems;
  };

  // Calcular estadísticas del presupuesto
  const calculateStats = (items) => {
    const total = items.reduce((sum, item) => sum + item.precioTotal, 0);
    const totalItems = items.length;
    const categories = [...new Set(items.map(item => item.categoria))].length;
    const suppliers = [...new Set(items.map(item => item.proveedor))].length;
    
    const statusCounts = items.reduce((acc, item) => {
      acc[item.estado] = (acc[item.estado] || 0) + 1;
      return acc;
    }, {});

    setStats({
      total,
      totalItems,
      categories,
      suppliers,
      aprobados: statusCounts.aprobado || 0,
      pendientes: statusCounts.pendiente || 0,
      cotizados: statusCounts.cotizado || 0
    });
  };

  // Filtrar y ordenar datos
  const getFilteredData = () => {
    let filtered = budgetData;

    console.log(`🔍 Datos base para filtrar: ${filtered.length} materiales`);

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(`🔍 Después de filtro de búsqueda "${searchTerm}": ${filtered.length} materiales`);
    }

    // Filtro por categoría
    if (filterCategory) {
      filtered = filtered.filter(item => item.categoria === filterCategory);
      console.log(`🔍 Después de filtro de categoría "${filterCategory}": ${filtered.length} materiales`);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'descripcion':
          return a.descripcion.localeCompare(b.descripcion);
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        case 'precio':
          return b.precioTotal - a.precioTotal;
        case 'proveedor':
          return a.proveedor.localeCompare(b.proveedor);
        case 'fecha':
          return new Date(b.fechaCotizacion) - new Date(a.fechaCotizacion);
        default:
          return 0;
      }
    });

    console.log(`✅ Datos filtrados finales: ${filtered.length} materiales`);
    return filtered;
  };

  // Exportar presupuesto a CSV
  const exportBudget = () => {
    if (!selectedProject || budgetData.length === 0) {
      notifyError('Selecciona un proyecto con presupuesto para exportar');
      return;
    }

    // Obtener los datos filtrados que se están mostrando actualmente
    const dataToExport = getFilteredData();
    
    if (dataToExport.length === 0) {
      notifyError('No hay datos para exportar con los filtros actuales');
      return;
    }

    console.log(`📊 Exportando ${dataToExport.length} materiales del proyecto ${selectedProject.name}`);

    const headers = [
      'Código', 'Descripción', 'Categoría', 'Cantidad', 'Unidad', 
      'Precio Unitario', 'Precio Total', 'Proveedor', 'Contacto Proveedor', 'Estado', 'Fecha', 'Observaciones'
    ];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => [
        `"${item.codigo || ''}"`,
        `"${item.descripcion || ''}"`,
        `"${item.categoria || ''}"`,
        item.cantidad || 0,
        `"${item.unidad || ''}"`,
        item.precioUnitario || 0,
        item.precioTotal || 0,
        `"${item.proveedor || ''}"`,
        `"${item.proveedorContacto || ''}"`,
        `"${item.estado || ''}"`,
        `"${item.fechaCotizacion || ''}"`,
        `"${item.observaciones || ''}"`
      ].join(','))
    ].join('\n');

    // Agregar BOM para caracteres especiales y mejor compatibilidad con Excel
    const BOM = '\uFEFF';
    const finalContent = BOM + csvContent;

    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generar nombre de archivo más descriptivo
    const fileName = `presupuesto_${selectedProject.code || selectedProject.id}_${selectedProject.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    
    // Crear y activar el enlace de descarga
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notifySuccess(`✅ Presupuesto exportado: ${dataToExport.length} materiales en ${fileName}`);
  };

  // Editar material
  const editMaterial = (materialId) => {
    const material = budgetData.find(item => item.id === materialId);
    if (!material) return;

    // Crear un formulario simple para editar
    const newDescripcion = prompt('Nueva descripción:', material.descripcion);
    if (newDescripcion === null) return; // Usuario canceló

    const newCantidad = prompt('Nueva cantidad:', material.cantidad);
    if (newCantidad === null) return;

    const newPrecioUnitario = prompt('Nuevo precio unitario:', material.precioUnitario);
    if (newPrecioUnitario === null) return;

    // Validar entradas
    const cantidad = parseFloat(newCantidad);
    const precioUnitario = parseFloat(newPrecioUnitario);

    if (isNaN(cantidad) || cantidad <= 0) {
      notifyError('La cantidad debe ser un número positivo');
      return;
    }

    if (isNaN(precioUnitario) || precioUnitario < 0) {
      notifyError('El precio unitario debe ser un número válido');
      return;
    }

    // Actualizar el material
    const updatedBudgetData = budgetData.map(item => {
      if (item.id === materialId) {
        return {
          ...item,
          descripcion: newDescripcion.trim(),
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          precioTotal: cantidad * precioUnitario
        };
      }
      return item;
    });

    setBudgetData(updatedBudgetData);
    calculateStats(updatedBudgetData);
    notifySuccess('Material actualizado exitosamente');
  };

  // Eliminar material
  const deleteMaterial = (materialId) => {
    const material = budgetData.find(item => item.id === materialId);
    if (!material) return;

    setMaterialToDelete(material);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (materialToDelete) {
      const updatedBudgetData = budgetData.filter(item => item.id !== materialToDelete.id);
      setBudgetData(updatedBudgetData);
      calculateStats(updatedBudgetData);
      notifySuccess('Material eliminado exitosamente');
    }
    setShowDeleteModal(false);
    setMaterialToDelete(null);
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMaterialToDelete(null);
  };

  // Recargar proyectos manualmente
  const reloadProjects = async () => {
    try {
      setLoading(true);
      console.log('🔄 Recargando proyectos...');
      
      const response = await fetch(`${API_BASE_URL}/projects`);
      const data = await response.json();
      
      if (response.ok && data) {
        const projectsWithCorrectFormat = data.map(project => ({
          id: project._id,
          name: project.nombre,
          code: project.codigo,
          description: project.descripcion,
          status: project.estado,
          budget: project.presupuesto || null,
          type: project.tipo || 'construcción'
        }));
        setProjects(projectsWithCorrectFormat);
        notifySuccess(`${projectsWithCorrectFormat.length} proyectos recargados exitosamente`);
        console.log(`✅ ${projectsWithCorrectFormat.length} proyectos recargados:`, projectsWithCorrectFormat.map(p => ({ id: p.id, name: p.name, code: p.code })));
      } else {
        console.error('❌ Error en respuesta del servidor:', data);
        setProjects([]);
        notifyError('Error al recargar proyectos desde el servidor');
      }
    } catch (error) {
      console.error('❌ Error recargando proyectos:', error);
      setProjects([]);
      notifyError('Error de conexión al recargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = getFilteredData();
  const categories = [...new Set(budgetData.map(item => item.categoria))].sort();

  // Función de debug para testing
  window.debugPresupuestos = {
    budgetData,
    filteredData,
    selectedProject,
    exportBudget,
    stats,
    getFilteredData
  };

  // Función para obtener color del estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cotizado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Descripciones de los estados
  const getStatusDescription = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'Material aprobado para compra. Cotización aceptada y autorizada para proceder con la orden de compra.';
      case 'pendiente':
        return 'Material en revisión. Cotización recibida pero aún no ha sido evaluada o aprobada por el equipo responsable.';
      case 'cotizado':
        return 'Material cotizado pero no aprobado. Se ha solicitado cotización al proveedor pero aún no se ha tomado una decisión.';
      default:
        return 'Estado no definido para este material.';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">💰 Presupuestos de Proyectos</h1>
            <p className="text-gray-600 mt-2">
              Gestión de presupuestos de materiales por proyecto
            </p>
          </div>
          {selectedProject && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Proyecto seleccionado</div>
              <div className="text-lg font-semibold text-blue-800">{selectedProject.name}</div>
              {stats && (
                <div className="text-sm text-green-600">
                  Total: ${stats.total.toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selector de Proyectos */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">🏗️ Seleccionar Proyecto</h2>
          <div className="text-sm text-gray-500">
            Total proyectos: <span className="font-semibold">{projects.length}</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Cargando proyectos...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-lg font-semibold mb-2">No hay proyectos disponibles</h3>
              <p className="text-sm mb-4">
                Los proyectos creados en la página "Proyectos" aparecerán aquí automáticamente.
              </p>
              <div className="text-xs text-gray-400 mb-4">
                URL de API: {API_BASE_URL}/projects
              </div>
            </div>
            <button
              onClick={reloadProjects}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Recargar Proyectos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`p-4 border rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-sm mb-2">{project.name}</div>
                <div className="text-xs text-blue-600 font-mono mb-2">#{project.code}</div>
                {project.description && (
                  <div className="text-xs text-gray-500 mb-2 line-clamp-2">{project.description}</div>
                )}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-green-600 font-medium">
                    {project.budget ? `$${(project.budget / 1000000).toFixed(1)}M` : 'Sin presupuesto'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'Finalizado' || project.status === 'Completado'
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'En Ejecución' || project.status === 'En ejecución'
                      ? 'bg-blue-100 text-blue-800'
                      : project.status === 'Planificación'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status || 'Planificación'}
                  </div>
                </div>
                {project.type && (
                  <div className="text-xs text-gray-500 mt-1 capitalize">{project.type}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas del Presupuesto */}
      {selectedProject && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">${(stats.total / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">Total Presupuesto</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.totalItems}</div>
            <div className="text-sm text-gray-600">Items</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
            <div className="text-sm text-gray-600">Categorías</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.suppliers}</div>
            <div className="text-sm text-gray-600">Proveedores</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center relative">
            <div className="text-2xl font-bold text-green-600">{stats.aprobados}</div>
            <div 
              className="text-sm text-gray-600 cursor-help"
              onMouseEnter={() => setShowTooltip('aprobados')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              Aprobados ℹ️
            </div>
            {showTooltip === 'aprobados' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10 w-64">
                <div className="font-semibold mb-1">✅ Materiales Aprobados</div>
                {getStatusDescription('aprobado')}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center relative">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
            <div 
              className="text-sm text-gray-600 cursor-help"
              onMouseEnter={() => setShowTooltip('pendientes')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              Pendientes ℹ️
            </div>
            {showTooltip === 'pendientes' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10 w-64">
                <div className="font-semibold mb-1">⏳ Materiales Pendientes</div>
                {getStatusDescription('pendiente')}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center relative">
            <div className="text-2xl font-bold text-blue-600">{stats.cotizados}</div>
            <div 
              className="text-sm text-gray-600 cursor-help"
              onMouseEnter={() => setShowTooltip('cotizados')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              Cotizados ℹ️
            </div>
            {showTooltip === 'cotizados' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10 w-64">
                <div className="font-semibold mb-1">💰 Materiales Cotizados</div>
                {getStatusDescription('cotizado')}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      {selectedProject && budgetData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar Item
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descripción, código, proveedor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📂 Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="descripcion">Descripción</option>
                <option value="categoria">Categoría</option>
                <option value="precio">Precio (mayor a menor)</option>
                <option value="proveedor">Proveedor</option>
                <option value="fecha">Fecha cotización</option>
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Mostrando {filteredData.length} de {budgetData.length} items
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setSortBy('descripcion');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                🔄 Limpiar Filtros
              </button>
              <button
                onClick={exportBudget}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📊 Exportar CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Presupuesto */}
      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando presupuesto...</p>
            </div>
          ) : budgetData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin presupuesto</h3>
              <p className="text-gray-600">
                Este proyecto no tiene presupuesto de materiales definido.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código & Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.codigo}</div>
                          <div className="text-sm text-gray-500">{item.descripcion}</div>
                          {item.observaciones && (
                            <div className="text-xs text-blue-600 mt-1">💡 {item.observaciones}</div>
                          )}
                          {/* Botones de acción */}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => editMaterial(item.id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 transition-colors"
                              title="Editar material"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => deleteMaterial(item.id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 transition-colors"
                              title="Eliminar material"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.cantidad.toLocaleString()} {item.unidad}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${item.precioUnitario.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${item.precioTotal.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">{item.proveedor}</div>
                          {item.proveedorContacto && (
                            <div className="text-xs text-gray-500">📞 {item.proveedorContacto}</div>
                          )}
                          <div className="text-xs text-gray-500">📅 {item.fechaCotizacion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative">
                        <span 
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-help ${getStatusColor(item.estado)}`}
                          onMouseEnter={() => setShowTooltip(`estado-${item.id}`)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          {item.estado === 'aprobado' && '✅'} 
                          {item.estado === 'pendiente' && '⏳'} 
                          {item.estado === 'cotizado' && '💰'} 
                          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)} ℹ️
                        </span>
                        {showTooltip === `estado-${item.id}` && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-20 w-64">
                            <div className="font-semibold mb-1">
                              {item.estado === 'aprobado' && '✅ Material Aprobado'}
                              {item.estado === 'pendiente' && '⏳ Material Pendiente'}
                              {item.estado === 'cotizado' && '💰 Material Cotizado'}
                            </div>
                            {getStatusDescription(item.estado)}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mensaje inicial */}
      {!selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un Proyecto</h3>
          <p className="text-gray-600">
            Elige un proyecto arriba para ver su presupuesto detallado de materiales
          </p>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && materialToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🗑️ Confirmar Eliminación
              </h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    ¿Eliminar este material?
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-sm font-medium text-gray-700">{materialToDelete.codigo}</div>
                    <div className="text-sm text-gray-600">{materialToDelete.descripcion}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {materialToDelete.cantidad} {materialToDelete.unidad} • ${materialToDelete.precioTotal.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Esta acción eliminará permanentemente este material del presupuesto y 
                    <strong className="text-red-600"> no se puede deshacer</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                🗑️ Eliminar Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
