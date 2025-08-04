import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import ApiService from '../services/ApiService';
import CotizacionService from '../services/CotizacionService';
import ProjectService from '../services/ProjectService';

export default function Presupuestos() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('descripcion');
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Cargar proyectos al inicializar
  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true);
        console.log('📊 Cargando proyectos para presupuestos...');
        
        // Intentar cargar desde API primero
        const response = await ApiService.get('/projects');
        
        if (response.success && response.data) {
          setProjects(response.data);
          notifyInfo(`${response.data.length} proyectos cargados desde la base de datos`);
        } else {
          // Fallback a ProjectService si no hay conexión
          const fallbackProjects = ProjectService.getAllProjectsOffline();
          setProjects(fallbackProjects);
          notifyInfo(`${fallbackProjects.length} proyectos cargados (modo offline)`);
        }
      } catch (error) {
        console.error('❌ Error cargando proyectos:', error);
        
        // Fallback a ProjectService
        const fallbackProjects = ProjectService.getAllProjectsOffline();
        setProjects(fallbackProjects);
        notifyError('Error de conexión. Usando datos locales');
      } finally {
        setLoading(false);
      }
    };

    loadProjectsData();
  }, [notifyInfo, notifyError]);

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
          
          notifySuccess(`Presupuesto cargado: ${budgetItems.length} items`);
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
  }, [selectedProject, notifySuccess, notifyError]);

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

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filterCategory) {
      filtered = filtered.filter(item => item.categoria === filterCategory);
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

    return filtered;
  };

  // Exportar presupuesto a CSV
  const exportBudget = () => {
    if (!selectedProject || budgetData.length === 0) {
      notifyError('Selecciona un proyecto con presupuesto para exportar');
      return;
    }

    const headers = [
      'Código', 'Descripción', 'Categoría', 'Cantidad', 'Unidad', 
      'Precio Unitario', 'Precio Total', 'Proveedor', 'Estado', 'Fecha'
    ];

    const csvContent = [
      headers.join(','),
      ...budgetData.map(item => [
        item.codigo,
        `"${item.descripcion}"`,
        item.categoria,
        item.cantidad,
        item.unidad,
        item.precioUnitario,
        item.precioTotal,
        `"${item.proveedor}"`,
        item.estado,
        item.fechaCotizacion
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `presupuesto_${selectedProject.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);

    notifySuccess('Presupuesto exportado exitosamente');
  };

  // Recargar proyectos manualmente
  const reloadProjects = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/projects');
      
      if (response.success && response.data) {
        setProjects(response.data);
        notifySuccess(`${response.data.length} proyectos recargados`);
      } else {
        const fallbackProjects = ProjectService.getAllProjectsOffline();
        setProjects(fallbackProjects);
        notifyInfo(`${fallbackProjects.length} proyectos cargados (modo offline)`);
      }
    } catch (error) {
      const fallbackProjects = ProjectService.getAllProjectsOffline();
      setProjects(fallbackProjects);
      notifyError('Error de conexión. Usando datos locales');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = getFilteredData();
  const categories = [...new Set(budgetData.map(item => item.categoria))].sort();

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
        <h2 className="text-xl font-semibold mb-4">🏗️ Seleccionar Proyecto</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Cargando proyectos...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No hay proyectos disponibles</div>
            <button
              onClick={reloadProjects}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                {project.description && (
                  <div className="text-xs text-gray-500 mb-2 line-clamp-2">{project.description}</div>
                )}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-green-600 font-medium">
                    {project.budget ? `$${(project.budget / 1000000).toFixed(1)}M` : 'Sin presupuesto'}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'active' || project.status === 'En Progreso'
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'completed' || project.status === 'Completado'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status || 'activo'}
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
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.aprobados}</div>
            <div className="text-sm text-gray-600">Aprobados</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.cotizados}</div>
            <div className="text-sm text-gray-600">Cotizados</div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.estado)}`}>
                          {item.estado === 'aprobado' && '✅'} 
                          {item.estado === 'pendiente' && '⏳'} 
                          {item.estado === 'cotizado' && '💰'} 
                          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                        </span>
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
    </div>
  );
}
