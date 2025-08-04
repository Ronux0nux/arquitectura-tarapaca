import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import ProvidersListService from '../services/ProvidersListService';

export default function ProvidersList() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showCertified, setShowCertified] = useState(false);
  const [sortBy, setSortBy] = useState('nombre');
  const [currentPage, setCurrentPage] = useState(1);
  const [statistics, setStatistics] = useState(null);
  const itemsPerPage = 15;
  const { notifySuccess } = useNotifications();

  // Cargar datos al montar el componente
  useEffect(() => {
    setLoading(true);
    
    // Cargar datos del servicio
    setTimeout(() => {
      const providersData = ProvidersListService.getExpandedProvidersData();
      const stats = ProvidersListService.getProviderStatistics(providersData);
      
      setProviders(providersData);
      setFilteredProviders(providersData);
      setStatistics(stats);
      setLoading(false);
      
      // Guardar en localStorage
      ProvidersListService.saveToLocalStorage(providersData);
      
      // Datos cargados sin notificación automática
    }, 1000);
  }, []);

  // Filtrar proveedores basado en búsqueda y filtros
  useEffect(() => {
    const filters = {
      categoria: selectedCategory,
      tamaño: selectedSize,
      conCertificaciones: showCertified,
      vigente: true // Solo mostrar vigentes por defecto
    };

    const filtered = ProvidersListService.searchProviders(providers, searchTerm, filters);

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        case 'fecha':
          return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
        case 'empleados':
          return a.empleados.localeCompare(b.empleados);
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSize, showCertified, sortBy, providers]);

  // Obtener valores únicos para filtros
  const categories = [...new Set(providers.map(p => p.categoria))].sort();
  const sizes = [...new Set(providers.map(p => p.empleados))].sort();

  // Calcular paginación
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProviders = filteredProviders.slice(startIndex, endIndex);

  // Exportar datos
  const exportToCSV = () => {
    const csvContent = ProvidersListService.exportProviders(filteredProviders, 'csv');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `proveedores_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    
    notifySuccess('Lista de proveedores exportada exitosamente', 'Exportación Completada');
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSize('');
    setShowCertified(false);
    setSortBy('nombre');
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📋 Lista de Proveedores Vigentes</h2>
            <p className="text-gray-600">Basado en: ListadoProveedoresVigentes-04-08-2025.pdf</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
              <div className="text-sm text-blue-600">Total Proveedores</div>
              <div className="text-xl font-bold text-blue-800">{providers.length}</div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg text-center">
              <div className="text-sm text-green-600">Resultados</div>
              <div className="text-xl font-bold text-green-800">{filteredProviders.length}</div>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-lg text-center">
              <div className="text-sm text-purple-600">Categorías</div>
              <div className="text-xl font-bold text-purple-800">{categories.length}</div>
            </div>
            {statistics && (
              <div className="bg-orange-50 px-4 py-2 rounded-lg text-center">
                <div className="text-sm text-orange-600">Con Certificaciones</div>
                <div className="text-xl font-bold text-orange-800">{statistics.conCertificaciones}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar Proveedor
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, RUT, categoría, especialidad, certificaciones..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Filtro por tamaño */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👥 Tamaño Empresa
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size} empleados</option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔄 Ordenar por categoria
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nombre">Nombre A-Z</option>
              <option value="categoria">Categoría</option>
              <option value="empleados">Tamaño Empresa</option>
              <option value="fecha">Fecha Registro</option>
            </select>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showCertified}
              onChange={(e) => setShowCertified(e.target.checked)}
              className="mr-2 rounded"
            />
            <span className="text-sm text-gray-700">🏆 Solo con certificaciones</span>
          </label>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProviders.length)} de {filteredProviders.length} proveedores
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              🔄 Limpiar Filtros
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Lista de proveedores */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proveedores desde PDF...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría & Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {provider.nombre}
                        </div>
                        <div className="text-sm text-gray-500">RUT: {provider.rut}</div>
                        <div className="text-sm text-gray-500">{provider.direccion}</div>
                        {provider.sitioWeb && (
                          <div className="text-sm text-blue-600">
                            🌐 <a href={`https://${provider.sitioWeb}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {provider.sitioWeb}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>📞 {provider.telefono}</div>
                        <div>✉️ {provider.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.categoria === 'Construcción' ? 'bg-blue-100 text-blue-800' :
                          provider.categoria === 'Materiales' ? 'bg-green-100 text-green-800' :
                          provider.categoria === 'Electricidad' ? 'bg-yellow-100 text-yellow-800' :
                          provider.categoria === 'Transporte' ? 'bg-purple-100 text-purple-800' :
                          provider.categoria === 'Minería' ? 'bg-orange-100 text-orange-800' :
                          provider.categoria === 'Plomería' ? 'bg-cyan-100 text-cyan-800' :
                          provider.categoria === 'Ingeniería' ? 'bg-indigo-100 text-indigo-800' :
                          provider.categoria === 'Seguridad' ? 'bg-red-100 text-red-800' :
                          provider.categoria === 'Limpieza' ? 'bg-pink-100 text-pink-800' :
                          provider.categoria === 'Informática' ? 'bg-teal-100 text-teal-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.categoria}
                        </span>
                        <div className="text-xs text-gray-500">
                          👥 {provider.empleados} empleados
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{provider.especialidad}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {provider.certificaciones && provider.certificaciones.length > 0 ? (
                          provider.certificaciones.map((cert, index) => (
                            <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                              🏆 {cert}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">Sin certificaciones</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        provider.vigente ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.vigente ? '✅ Vigente' : '❌ No Vigente'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Registro: {new Date(provider.fechaRegistro).toLocaleDateString()}
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
                      Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
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
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
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
        </div>
      )}

      {/* Mensaje si no hay resultados */}
      {!loading && filteredProviders.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proveedores</h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar los filtros de búsqueda o revisar los términos utilizados.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
