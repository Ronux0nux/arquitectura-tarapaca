import React, { useState } from 'react';
import { useCotizaciones } from '../context/CotizacionesContext';
import { useCart } from '../context/CartContext';

const HistorialCotizaciones = () => {
  const { cotizaciones, productosDatabase, eliminarCotizacion, buscarEnDatabase, getProductosMasUsados, getProductosRecientes, getEstadisticas } = useCotizaciones();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('historial');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const estadisticas = getEstadisticas();

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim()) {
      const results = buscarEnDatabase(term);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddToCartFromDatabase = (producto) => {
    addToCart(producto);
    
    // Mostrar notificación
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = '✓ Producto agregado desde la base de datos';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const formatMonto = (monto) => {
    return monto > 0 ? `$${monto.toLocaleString('es-CL')}` : 'N/A';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Historial de Cotizaciones</h2>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">Total Cotizaciones</h3>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.totalCotizaciones}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Productos Únicos</h3>
            <p className="text-2xl font-bold text-green-600">{estadisticas.totalProductosUnicos}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Monto Total</h3>
            <p className="text-2xl font-bold text-purple-600">{formatMonto(estadisticas.montoTotalEstimado)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800">Promedio/Cotización</h3>
            <p className="text-2xl font-bold text-yellow-600">{formatMonto(estadisticas.cotizacionPromedio)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'historial' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 Historial
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'database' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗄️ Base de Datos
          </button>
          <button
            onClick={() => setActiveTab('buscar')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'buscar' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔍 Buscar Productos
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'historial' && (
          <div className="space-y-4">
            {cotizaciones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay cotizaciones guardadas</p>
                <p className="text-gray-400 text-sm mt-2">Exporta una cotización desde el carrito para crear historial</p>
              </div>
            ) : (
              cotizaciones.map((cotizacion) => (
                <div key={cotizacion.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {cotizacion.projectName || 'Proyecto sin nombre'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Cliente: {cotizacion.clientName || 'No especificado'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Fecha: {cotizacion.fechaFormateada}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatMonto(cotizacion.montoEstimado)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cotizacion.totalItems} items ({cotizacion.totalProductos} productos)
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <h5 className="font-medium text-gray-700 mb-2">Productos:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cotizacion.productos.slice(0, 6).map((producto, index) => (
                        <div key={`${cotizacion.id}-producto-${index}`} className="text-xs bg-gray-50 p-2 rounded">
                          <p className="font-medium truncate">{producto.title}</p>
                          <p className="text-gray-500">
                            {producto.quantity || 1} {producto.unit || 'un'} - {producto.price || 'Consultar'}
                          </p>
                        </div>
                      ))}
                    </div>
                    {cotizacion.productos.length > 6 && (
                      <p className="text-xs text-gray-500 mt-2">
                        ...y {cotizacion.productos.length - 6} productos más
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => eliminarCotizacion(cotizacion.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Productos más usados */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">🔥 Productos Más Usados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getProductosMasUsados().map((producto) => (
                  <div key={producto.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-800 mb-2 truncate">
                      {producto.title}
                    </h4>
                    <p className="text-lg font-bold text-green-600 mb-1">
                      {producto.price || 'Consultar'}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {producto.source}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Usado {producto.vecesUsado} veces
                      </span>
                      <button
                        onClick={() => handleAddToCartFromDatabase(producto)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        🛒 Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Productos recientes */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">🕒 Productos Recientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getProductosRecientes().map((producto) => (
                  <div key={producto.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-800 mb-2 truncate">
                      {producto.title}
                    </h4>
                    <p className="text-lg font-bold text-green-600 mb-1">
                      {producto.price || 'Consultar'}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {producto.source}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {new Date(producto.ultimoUso).toLocaleDateString('es-CL')}
                      </span>
                      <button
                        onClick={() => handleAddToCartFromDatabase(producto)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        🛒 Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buscar' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Buscar en base de datos de productos..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {searchTerm && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.length > 0 ? (
                  searchResults.map((producto) => (
                    <div key={producto.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-sm text-gray-800 mb-2 truncate">
                        {producto.title}
                      </h4>
                      <p className="text-lg font-bold text-green-600 mb-1">
                        {producto.price || 'Consultar'}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {producto.source}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                            Usado {producto.vecesUsado} veces
                          </span>
                          <span className="text-xs text-gray-500">
                            {producto.category || 'Sin categoría'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCartFromDatabase(producto)}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          🛒 Agregar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">No se encontraron productos</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialCotizaciones;
