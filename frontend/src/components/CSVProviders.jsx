import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { sampleCSVProviders } from '../data/sampleCSVData';

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

  useEffect(() => {
    // Datos cargados sin notificación automática
  }, []);

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
                        {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                          const pageNumber = i + 1;
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
