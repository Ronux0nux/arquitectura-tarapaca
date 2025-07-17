import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import providerService from '../services/ProviderService';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerStats, setProviderStats] = useState({});
  const [loading, setLoading] = useState(false);
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Lista completa de proveedores con más información
  const allProviders = [
    {
      id: 'sodimac',
      name: 'Sodimac',
      icon: '🏪',
      website: 'https://www.sodimac.cl',
      phone: '+56 2 2444 4444',
      email: 'contacto@sodimac.cl',
      address: 'Av. Providencia 1308, Providencia, Santiago',
      status: 'activo',
      rating: 4.5,
      categories: ['Construcción', 'Herramientas', 'Jardinería', 'Baño', 'Cocina'],
      description: 'Líder en retail de mejoramiento del hogar y construcción en Chile.',
      paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito'],
      deliveryTime: '2-5 días',
      minOrder: 50000,
      discount: '5% corporativo'
    },
    {
      id: 'easy',
      name: 'Easy',
      icon: '🏬',
      website: 'https://www.easy.cl',
      phone: '+56 2 2888 8888',
      email: 'contacto@easy.cl',
      address: 'Av. Las Condes 11049, Las Condes, Santiago',
      status: 'activo',
      rating: 4.3,
      categories: ['Construcción', 'Decoración', 'Herramientas', 'Jardinería'],
      description: 'Tienda de mejoramiento del hogar con amplia variedad de productos.',
      paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia'],
      deliveryTime: '3-7 días',
      minOrder: 75000,
      discount: '3% por volumen'
    },
    {
      id: 'construmart',
      name: 'Construmart',
      icon: '🏭',
      website: 'https://www.construmart.cl',
      phone: '+56 2 2333 3333',
      email: 'ventas@construmart.cl',
      address: 'Av. Vicuña Mackenna 1370, Ñuñoa, Santiago',
      status: 'activo',
      rating: 4.1,
      categories: ['Construcción', 'Materiales', 'Herramientas', 'Eléctrico'],
      description: 'Especialistas en materiales de construcción y herramientas profesionales.',
      paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito', 'Cheque'],
      deliveryTime: '1-3 días',
      minOrder: 100000,
      discount: '7% corporativo'
    },
    {
      id: 'imperial',
      name: 'Imperial',
      icon: '🏛️',
      website: 'https://www.imperial.cl',
      phone: '+56 2 2777 7777',
      email: 'comercial@imperial.cl',
      address: 'Av. Matta 1140, Santiago Centro, Santiago',
      status: 'activo',
      rating: 4.4,
      categories: ['Construcción', 'Materiales', 'Ferretería', 'Eléctrico'],
      description: 'Distribuidora de materiales de construcción con más de 50 años de experiencia.',
      paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito'],
      deliveryTime: '2-4 días',
      minOrder: 80000,
      discount: '6% por volumen'
    },
    {
      id: 'homecenter',
      name: 'Homecenter',
      icon: '🏠',
      website: 'https://www.homecenter.cl',
      phone: '+56 2 2555 5555',
      email: 'info@homecenter.cl',
      address: 'Av. Kennedy 9001, Las Condes, Santiago',
      status: 'activo',
      rating: 4.2,
      categories: ['Construcción', 'Decoración', 'Muebles', 'Jardinería'],
      description: 'Centro de mejoramiento del hogar con enfoque en decoración y construcción.',
      paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia'],
      deliveryTime: '3-6 días',
      minOrder: 60000,
      discount: '4% corporativo'
    },
    {
      id: 'maestro',
      name: 'Maestro',
      icon: '🔨',
      website: 'https://www.maestro.cl',
      phone: '+56 2 2666 6666',
      email: 'ventas@maestro.cl',
      address: 'Av. Irarrázaval 2323, Ñuñoa, Santiago',
      status: 'activo',
      rating: 4.0,
      categories: ['Herramientas', 'Ferretería', 'Construcción', 'Eléctrico'],
      description: 'Especialistas en herramientas y ferretería para profesionales.',
      paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito'],
      deliveryTime: '1-2 días',
      minOrder: 40000,
      discount: '8% profesional'
    }
  ];

  useEffect(() => {
    setProviders(allProviders);
    setFilteredProviders(allProviders);
    generateProviderStats();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchTerm, providers]);

  const filterProviders = () => {
    if (!searchTerm) {
      setFilteredProviders(providers);
      return;
    }

    const filtered = providers.filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProviders(filtered);
  };

  const generateProviderStats = () => {
    const stats = {
      total: allProviders.length,
      active: allProviders.filter(p => p.status === 'activo').length,
      avgRating: (allProviders.reduce((sum, p) => sum + p.rating, 0) / allProviders.length).toFixed(1),
      categories: [...new Set(allProviders.flatMap(p => p.categories))].length
    };
    setProviderStats(stats);
  };

  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
    notifyInfo(`Viendo detalles de ${provider.name}`, 'Proveedor');
  };

  const handleTestProvider = async (providerId) => {
    setLoading(true);
    notifyInfo('Probando conexión con proveedor...', 'Prueba de Conexión');
    
    // Simular prueba de conexión
    setTimeout(() => {
      notifySuccess(`Conexión exitosa con ${providerId}`, 'Prueba Completada');
      setLoading(false);
    }, 2000);
  };

  const handleSearchProvider = async (providerId, query) => {
    setLoading(true);
    try {
      const result = await providerService.searchProducts(providerId, query);
      if (result.success) {
        notifySuccess(`Encontrados ${result.data.length} productos en ${result.provider.name}`, 'Búsqueda Exitosa');
      } else {
        notifyError(`Error al buscar en ${result.provider.name}: ${result.error}`, 'Error de Búsqueda');
      }
    } catch (error) {
      notifyError(`Error al conectar con ${providerId}`, 'Error de Conexión');
    }
    setLoading(false);
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-${i <= rating ? 'yellow' : 'gray'}-400`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🏢 Gestión de Proveedores</h1>
        <p className="text-gray-600">Administra y busca proveedores para tus cotizaciones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Proveedores</p>
              <p className="text-2xl font-bold text-gray-800">{providerStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{providerStats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rating Promedio</p>
              <p className="text-2xl font-bold text-yellow-600">{providerStats.avgRating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Categorías</p>
              <p className="text-2xl font-bold text-purple-600">{providerStats.categories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar proveedores por nombre, categoría, descripción o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Mostrando {filteredProviders.length} de {providers.length} proveedores
        </p>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map(provider => (
          <div 
            key={provider.id} 
            className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleProviderClick(provider)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{provider.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{provider.name}</h3>
                    <div className="flex items-center">
                      {getRatingStars(provider.rating)}
                      <span className="ml-2 text-sm text-gray-600">({provider.rating})</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                  {provider.status}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2">📞</span>
                  {provider.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2">📧</span>
                  {provider.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2">📍</span>
                  <span className="truncate">{provider.address}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-4 h-4 mr-2">🚚</span>
                  {provider.deliveryTime}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Categorías:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.categories.slice(0, 3).map(category => (
                    <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                  {provider.categories.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{provider.categories.length - 3} más
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {provider.description}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestProvider(provider.id);
                  }}
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm disabled:opacity-50"
                >
                  {loading ? 'Probando...' : 'Probar'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearchProvider(provider.id, 'cemento');
                  }}
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-sm disabled:opacity-50"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron proveedores</h3>
          <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">{selectedProvider.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedProvider.name}</h2>
                    <div className="flex items-center">
                      {getRatingStars(selectedProvider.rating)}
                      <span className="ml-2 text-gray-600">({selectedProvider.rating})</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Teléfono:</p>
                      <p className="font-medium">{selectedProvider.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email:</p>
                      <p className="font-medium">{selectedProvider.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Dirección:</p>
                      <p className="font-medium">{selectedProvider.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sitio Web:</p>
                      <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {selectedProvider.website}
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Detalles Comerciales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tiempo de Entrega:</p>
                      <p className="font-medium">{selectedProvider.deliveryTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pedido Mínimo:</p>
                      <p className="font-medium">${selectedProvider.minOrder.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Descuento:</p>
                      <p className="font-medium text-green-600">{selectedProvider.discount}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Métodos de Pago</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.paymentMethods.map(method => (
                      <span key={method} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Categorías</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.categories.map(category => (
                      <span key={category} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                  <p className="text-gray-600">{selectedProvider.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
