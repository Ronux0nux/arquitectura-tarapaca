import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import CSVProviderService from '../services/CSVProviderService';
import { sampleCSVProviders, sampleStats, sampleFileStats } from '../data/sampleCSVData';

export default function CSVProviders() {
  const [csvProviders, setCsvProviders] = useState([]);
  const [filteredCsvProviders, setFilteredCsvProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [csvStats, setCsvStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [providersPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'asc' });
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [fileStats, setFileStats] = useState(null);
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  useEffect(() => {
    loadCSVProviders();
    loadFileStats();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchTerm, csvProviders]);

  const loadCSVProviders = async () => {
    setLoading(true);
    setError(null); // Limpiar errores previos
    try {
      const response = await CSVProviderService.getAllCSVProviders();
      if (response.success) {
        setCsvProviders(response.data);
        setFilteredCsvProviders(response.data);
        
        // Generar estadísticas rápidas
        const quickStats = CSVProviderService.getQuickStats(response.data);
        setCsvStats({
          ...quickStats,
          metadata: response.metadata
        });

        notifySuccess(
          `Se cargaron ${response.data.length} proveedores desde ${response.metadata.processedFiles} archivos CSV`,
          'Datos CSV Cargados'
        );
        setIsDemo(false);
      } else {
        // Usar datos de ejemplo cuando no hay respuesta del servidor
        loadSampleData();
        notifyInfo('Mostrando datos de ejemplo (servidor no disponible)', 'Modo de Demostración');
      }
    } catch (error) {
      console.error('Error cargando CSV:', error);
      // Usar datos de ejemplo cuando hay error de conexión
      loadSampleData();
      notifyInfo('Mostrando datos de ejemplo (error de conexión)', 'Modo de Demostración');
    }
    setLoading(false);
  };

  const loadSampleData = () => {
    setCsvProviders(sampleCSVProviders);
    setFilteredCsvProviders(sampleCSVProviders);
    setCsvStats(sampleStats);
    setFileStats(sampleFileStats);
    setError(null);
  };

  const loadFileStats = async () => {
    try {
      const response = await CSVProviderService.getCSVStats();
      if (response.success) {
        setFileStats(response.stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
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
      const response = await CSVProviderService.searchCSVProviders(searchTerm, 100);
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
      CSVProviderService.exportToCSV(
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
    const validation = CSVProviderService.validateProvider(provider);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Proveedores desde Archivos CSV
              {isDemo && (
                <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-normal rounded-full">
                  🔧 Datos de Ejemplo
                </span>
              )}
            </h2>
            <p className="text-gray-600">
              {isDemo 
                ? "Mostrando datos de ejemplo - El servidor backend no está disponible"
                : "Datos importados desde la carpeta de cotizaciones manuales"
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadCSVProviders}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? '🔄' : '↻'} Recargar
            </button>
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
