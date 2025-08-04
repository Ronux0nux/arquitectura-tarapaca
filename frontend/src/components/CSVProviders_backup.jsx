import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { sampleCSVProviders, sampleStats, sampleFileStats } from '../data/sampleCSVData';

export default function CSVProviders() {
  const [csvProviders, setCsvProviders] = useState(sampleCSVProviders);
  const [filteredCsvProviders, setFilteredCsvProviders] = useState(sampleCSVProviders);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [providersPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'asc' });
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Filtrar proveedores basado en término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCsvProviders(csvProviders);
    } else {
      const filtered = csvProviders.filter(provider => 
        provider.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.rut?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.profession?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCsvProviders(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, csvProviders]);

  // Ordenar proveedores
  const sortedProviders = React.useMemo(() => {
    let sortableProviders = [...filteredCsvProviders];
    if (sortConfig.key) {
      sortableProviders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProviders;
  }, [filteredCsvProviders, sortConfig]);

  // Paginación
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = sortedProviders.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalPages = Math.ceil(sortedProviders.length / providersPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    // Convertir datos a CSV
    const csvContent = [
      ['Nombre Completo', 'RUT', 'Profesión', 'Fecha', 'Archivo'],
      ...csvProviders.map(provider => [
        provider.fullName || '',
        provider.rut || '',
        provider.profession || '',
        provider.date || '',
        provider.fileName || ''
      ])
    ].map(row => row.join(',')).join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `proveedores_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notifySuccess('Archivo CSV exportado exitosamente');
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{csvProviders.length}</div>
          <div className="text-sm text-blue-800">Total Proveedores</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {csvProviders.filter(p => p.rut).length}
          </div>
          <div className="text-sm text-green-800">Con RUT</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {csvProviders.filter(p => p.profession).length}
          </div>
          <div className="text-sm text-yellow-800">Con Profesión</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(csvProviders.map(p => p.fileName)).size}
          </div>
          <div className="text-sm text-purple-800">Archivos CSV</div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o profesión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* Lista de Proveedores */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Cargando proveedores...</div>
          </div>
        ) : currentProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">No se encontraron proveedores</p>
            <p className="text-gray-500">Intenta con diferentes términos de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('fullName')}
                    >
                      <div className="flex items-center gap-1">
                        Nombre Completo
                        {sortConfig.key === 'fullName' && (
                          <span className="text-blue-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rut')}
                    >
                      <div className="flex items-center gap-1">
                        RUT
                        {sortConfig.key === 'rut' && (
                          <span className="text-blue-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('profession')}
                    >
                      <div className="flex items-center gap-1">
                        Profesión
                        {sortConfig.key === 'profession' && (
                          <span className="text-blue-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        {sortConfig.key === 'date' && (
                          <span className="text-blue-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archivo Origen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProviders.map((provider, index) => (
                    <tr key={provider.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {provider.fullName || 'N/A'}
                        </div>
                        {provider.firstName && provider.lastName && (
                          <div className="text-xs text-gray-500">
                            {provider.firstName} {provider.lastName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {provider.rut || 'Sin RUT'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.profession 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.profession || 'No especificada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {provider.date ? new Date(provider.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {provider.fileName || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando{' '}
                        <span className="font-medium">{indexOfFirstProvider + 1}</span>
                        {' '}-{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastProvider, sortedProviders.length)}
                        </span>
                        {' '}de{' '}
                        <span className="font-medium">{sortedProviders.length}</span>
                        {' '}resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          ←
                        </button>
                        
                        {/* Números de página */}
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNumber = i + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNumber
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          →
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

  useEffect(() => {
    loadCSVProviders();
    loadFileStats();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchTerm, csvProviders]);

  /**
   * Cargar proveedores CSV desde la base de datos
   * Con fallback a datos de ejemplo si no hay conexión
   */
  const loadCSVProviders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando proveedores CSV...');
      
      // TEMPORAL: Cargar directamente datos de ejemplo para debug
      console.log('🧪 DEBUG: Cargando datos de ejemplo directamente...');
      setCsvProviders(sampleCSVProviders);
      setFilteredCsvProviders(sampleCSVProviders);
      setCsvStats(sampleStats);
      setDataSource('debug');
      setIsDemo(true);
      
      notifyInfo(
        `🧪 DEBUG: ${sampleCSVProviders.length} proveedores de ejemplo cargados`,
        'Modo Debug'
      );
      
      console.log(`✅ DEBUG: ${sampleCSVProviders.length} proveedores cargados`, sampleCSVProviders);
      
      // Comentado temporalmente para debug
      /*
      // Usar el nuevo servicio conectado a la base de datos
      const response = await ProviderService.getCSVProviders();
      
      if (response.success) {
        const providers = response.providers || [];
        setCsvProviders(providers);
        setFilteredCsvProviders(providers);
        setCsvStats(response.stats);
        setDataSource(response.source);
        
        // Mostrar notificación según el origen de datos
        if (response.source === 'database') {
          notifySuccess(
            `✅ ${providers.length} proveedores CSV cargados desde MongoDB Atlas`,
            'Datos desde Base de Datos'
          );
          setIsDemo(false);
        } else if (response.source === 'sample') {
          notifyInfo(
            `📱 ${providers.length} proveedores de ejemplo (modo offline)`,
            'Modo Sin Conexión'
          );
          setIsDemo(true);
        } else {
          notifyInfo(
            `💾 ${providers.length} proveedores desde cache local`,
            'Datos en Cache'
          );
          setIsDemo(false);
        }
        
        console.log(`✅ ${providers.length} proveedores CSV cargados (fuente: ${response.source})`);
      } else {
        throw new Error('No se pudieron cargar los proveedores CSV');
      }
      */
      
    } catch (error) {
      console.error('❌ Error cargando proveedores CSV:', error);
      setError(`Error cargando datos: ${error.message}`);
      
      // Fallback a datos de ejemplo
      setCsvProviders(sampleCSVProviders);
      setFilteredCsvProviders(sampleCSVProviders);
      setCsvStats(sampleStats);
      setDataSource('fallback');
      setIsDemo(true);
      
      notifyError(
        `Error de conexión. Mostrando ${sampleCSVProviders.length} proveedores de ejemplo`,
        'Modo Offline'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFileStats = async () => {
    try {
      // Usar estadísticas en tiempo real del nuevo servicio
      const stats = ProviderService.getDataStatus();
      setFileStats({
        ...sampleFileStats, // Mantener estructura base
        cache: {
          hasCache: stats.hasCache,
          hasLocalStorage: stats.hasLocalStorage,
          lastUpdate: stats.lastCacheUpdate,
          cacheSize: stats.cacheSize,
          localStorageSize: stats.localStorageSize
        },
        dataSource: dataSource || 'unknown'
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setFileStats(sampleFileStats); // Fallback
    }
  };

  /**
   * Refrescar datos desde la base de datos
   */
  const refreshData = async () => {
    console.log('🔄 Refrescando datos...');
    await loadCSVProviders();
    await loadFileStats();
  };

  /**
   * Cambiar a modo demo
   */
  const switchToDemo = () => {
    setCsvProviders(sampleCSVProviders);
    setFilteredCsvProviders(sampleCSVProviders);
    setCsvStats(sampleStats);
    setFileStats(sampleFileStats);
    setDataSource('demo');
    setIsDemo(true);
    setError(null);
    
    notifyInfo(
      `Modo demo activado. Mostrando ${sampleCSVProviders.length} proveedores de ejemplo`,
      'Modo Demostración'
    );
  };

  /**
   * Limpiar cache y datos locales
   */
  const clearLocalData = () => {
    ProviderService.clearLocalData();
    notifySuccess('Cache y datos locales eliminados', 'Datos Limpiados');
    loadCSVProviders(); // Recargar desde BD
  };

  const filterProviders = () => {
    if (!searchTerm) {
      setFilteredCsvProviders(csvProviders);
      return;
    }

    const filtered = csvProviders.filter(provider =>
      provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCsvProviders(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedProviders = [...filteredCsvProviders].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCsvProviders(sortedProviders);
  };

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      notifyError('El término de búsqueda debe tener al menos 2 caracteres', 'Búsqueda');
      return;
    }

    setLoading(true);
    try {
      // Usar el nuevo ProviderService para búsqueda
      const response = await ProviderService.searchProviders(searchTerm, { limit: 100 });
      if (response.success) {
        setFilteredCsvProviders(response.data);
        setCurrentPage(1);
        notifyInfo(
          `Se encontraron ${response.data.length} proveedores que coinciden con "${searchTerm}"`,
          'Búsqueda Completada'
        );
      }
    } catch (error) {
      notifyError(`Error en la búsqueda: ${error.message}`, 'Error');
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    try {
      // Función de exportación CSV manual
      const exportCSVProviders = (providers, filename) => {
        const headers = ['Nombre Completo', 'RUT', 'Profesión', 'Teléfono', 'Email', 'Región', 'Comuna'];
        const csvContent = [
          headers.join(','),
          ...providers.map(provider => [
            provider.fullName || '',
            provider.rut || '',
            provider.profession || '',
            provider.phone || '',
            provider.email || '',
            provider.region || '',
            provider.comuna || ''
          ].map(field => `"${field}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      exportCSVProviders(
        filteredCsvProviders,
        `proveedores_csv_${new Date().toISOString().split('T')[0]}.csv`
      );
      notifySuccess(
        `Se exportaron ${filteredCsvProviders.length} proveedores a CSV`,
        'Exportación Exitosa'
      );
    } catch (error) {
      notifyError(`Error al exportar: ${error.message}`, 'Error de Exportación');
    }
  };

  // Paginación
  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = filteredCsvProviders.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalPages = Math.ceil(filteredCsvProviders.length / providersPerPage);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getValidationStatus = (provider) => {
    // Función de validación manual de proveedores
    const validateProvider = (provider) => {
      const errors = [];
      
      if (!provider.fullName || provider.fullName.trim().length < 2) {
        errors.push('Nombre muy corto');
      }
      
      if (provider.rut && !/^\d{7,8}-[\dkK]$/.test(provider.rut)) {
        errors.push('RUT inválido');
      }
      
      if (provider.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(provider.email)) {
        errors.push('Email inválido');
      }
      
      if (provider.phone && !/^[+]?[\d\s\-()]{8,}$/.test(provider.phone)) {
        errors.push('Teléfono inválido');
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors
      };
    };
    
    const validation = validateProvider(provider);
    return validation.isValid ? 
      { status: 'valid', icon: '✅', color: 'text-green-600' } :
      { status: 'invalid', icon: '⚠️', color: 'text-yellow-600', errors: validation.errors };
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              📊 Proveedores desde Archivos CSV
              
              {/* Indicador de estado de conexión */}
              {dataSource === 'database' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-normal rounded-full flex items-center gap-1">
                  🌐 MongoDB Atlas
                </span>
              )}
              {dataSource === 'cache' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-normal rounded-full flex items-center gap-1">
                  💾 Cache Local
                </span>
              )}
              {dataSource === 'localStorage' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-normal rounded-full flex items-center gap-1">
                  💿 Almacenamiento Local
                </span>
              )}
              {(dataSource === 'sample' || dataSource === 'fallback' || dataSource === 'demo') && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-normal rounded-full flex items-center gap-1">
                  🔧 Modo Demo
                </span>
              )}
            </h2>
            
            <p className="text-gray-600">
              {dataSource === 'database' && "Datos en tiempo real desde MongoDB Atlas"}
              {dataSource === 'cache' && "Datos desde cache local (última actualización desde BD)"}
              {dataSource === 'localStorage' && "Datos guardados localmente"}
              {(dataSource === 'sample' || dataSource === 'fallback') && "Mostrando datos de ejemplo - Sin conexión a base de datos"}
              {dataSource === 'demo' && "Modo demostración activado"}
              {!dataSource && "Cargando datos de proveedores..."}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              title="Refrescar desde base de datos"
            >
              {loading ? '🔄' : '↻'} Recargar
            </button>
            
            {/* Botón para cambiar a modo demo */}
            {dataSource !== 'demo' && (
              <button
                onClick={switchToDemo}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                title="Cambiar a modo demostración"
              >
                🔧 Demo
              </button>
            )}
            
            {/* Botón para limpiar cache */}
            {(dataSource === 'cache' || dataSource === 'localStorage') && (
              <button
                onClick={clearLocalData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                title="Limpiar datos locales y recargar desde BD"
              >
                🗑️ Limpiar
              </button>
            )}
            
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              📥 Exportar CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {csvStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Proveedores</p>
                  <p className="text-2xl font-bold text-blue-900">{csvStats.total.toLocaleString()}</p>
                </div>
                <div className="text-blue-500 text-2xl">👥</div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Con RUT</p>
                  <p className="text-2xl font-bold text-green-900">{csvStats.conRUT.toLocaleString()}</p>
                </div>
                <div className="text-green-500 text-2xl">📋</div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Con Profesión</p>
                  <p className="text-2xl font-bold text-purple-900">{csvStats.conProfesion.toLocaleString()}</p>
                </div>
                <div className="text-purple-500 text-2xl">💼</div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Archivos</p>
                  <p className="text-2xl font-bold text-orange-900">{csvStats.metadata?.processedFiles || 0}</p>
                </div>
                <div className="text-orange-500 text-2xl">📁</div>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, RUT, profesión..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            🔍 Buscar
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados ({filteredCsvProviders.length.toLocaleString()})
            </h3>
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Cargando proveedores...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 mx-4">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar datos</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2 text-sm text-red-700 bg-red-100 p-4 rounded-lg">
                <p><strong>Posibles causas:</strong></p>
                <ul className="list-disc list-inside text-left space-y-1">
                  <li>El servidor backend no está en funcionamiento</li>
                  <li>Los archivos CSV no están disponibles en el servidor</li>
                  <li>Problemas de conectividad de red</li>
                </ul>
              </div>
              <button 
                onClick={loadCSVProviders}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : currentProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">No se encontraron proveedores</p>
            <p className="text-gray-500">Intenta con diferentes términos de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      ID {getSortIcon('id')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('fullName')}
                    >
                      Nombre Completo {getSortIcon('fullName')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rut')}
                    >
                      RUT {getSortIcon('rut')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('profession')}
                    >
                      Profesión {getSortIcon('profession')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      Fecha {getSortIcon('date')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProviders.map((provider, index) => {
                    const validation = getValidationStatus(provider);
                    return (
                      <tr key={`${provider.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {provider.id}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {provider.fullName}
                          </div>
                          {provider.firstName && provider.lastName && (
                            <div className="text-sm text-gray-500">
                              {provider.firstName} {provider.lastName}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {provider.rut || <span className="text-gray-400">No disponible</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {provider.profession || <span className="text-gray-400">No especificada</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {provider.date || <span className="text-gray-400">No disponible</span>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-sm ${validation.color}`}>
                            {validation.icon} {validation.status === 'valid' ? 'Válido' : 'Incompleto'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedProvider(provider)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Mostrando {indexOfFirstProvider + 1} a {Math.min(indexOfLastProvider, filteredCsvProviders.length)} de {filteredCsvProviders.length} proveedores
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-sm">
                    {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Detalles del Proveedor
                </h3>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RUT</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.rut || 'No disponible'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProvider.fullName}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.firstName || 'No disponible'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.lastName || 'No disponible'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido Materno</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.secondLastName || 'No disponible'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profesión</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.profession || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedProvider.date || 'No disponible'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Archivo Origen</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {selectedProvider.fileName}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Importación</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedProvider.importDate).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Stats Modal */}
      {fileStats && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">📁 Estadísticas de Archivos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total de archivos:</span>
              <span className="ml-2 text-gray-900">{fileStats.totalFiles}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total de registros:</span>
              <span className="ml-2 text-gray-900">{fileStats.totalRecords.toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Ruta:</span>
              <span className="ml-2 text-gray-600 text-xs font-mono">{fileStats.folderPath}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
