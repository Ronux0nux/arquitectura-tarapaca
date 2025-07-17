import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCotizaciones } from '../context/CotizacionesContext';
import { useCart } from '../context/CartContext';

export default function Cotizaciones() {
  const { cotizaciones, productosDatabase, eliminarCotizacion, getEstadisticas } = useCotizaciones();
  const { addToCart } = useCart();
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  
  const estadisticas = getEstadisticas();

  const formatMonto = (monto) => {
    return monto > 0 ? `$${monto.toLocaleString('es-CL')}` : 'N/A';
  };

  const handleAddProductoToCart = (producto) => {
    addToCart(producto);
    
    // Mostrar notificación
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = '✓ Producto agregado al carrito desde cotización';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">💼 Gestión de Cotizaciones</h1>
          <div className="flex gap-3">
            <Link
              to="/buscador"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              🔍 Buscar Materiales
            </Link>
            <Link
              to="/historial"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              📊 Ver Historial Completo
            </Link>
          </div>
        </div>

        {/* Estadísticas Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        {/* Cotizaciones Recientes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Cotizaciones Recientes</h2>
          {cotizaciones.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No hay cotizaciones guardadas</p>
              <p className="text-gray-400 mt-2">Comienza creando tu primera cotización</p>
              <Link
                to="/buscador"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                🔍 Buscar Materiales
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cotizaciones.slice(0, 5).map((cotizacion) => (
                <div key={cotizacion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-lg">
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
                      <p className="text-xl font-bold text-green-600">
                        {formatMonto(cotizacion.montoEstimado)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cotizacion.totalItems} items ({cotizacion.totalProductos} productos)
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-700">Productos en esta cotización:</h5>
                      <button
                        onClick={() => setSelectedCotizacion(selectedCotizacion === cotizacion.id ? null : cotizacion.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {selectedCotizacion === cotizacion.id ? 'Ocultar' : 'Ver productos'}
                      </button>
                    </div>
                    
                    {selectedCotizacion === cotizacion.id && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                        {cotizacion.productos.map((producto, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium text-sm truncate">{producto.title}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              {producto.quantity || 1} {producto.unit || 'un'} - {producto.price || 'Consultar'}
                            </p>
                            <p className="text-xs text-gray-400 mb-2">{producto.source}</p>
                            <button
                              onClick={() => handleAddProductoToCart(producto)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded transition-colors"
                            >
                              🛒 Agregar al carrito actual
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-4 gap-2">
                    <button
                      onClick={() => eliminarCotizacion(cotizacion.id)}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
              
              {cotizaciones.length > 5 && (
                <div className="text-center py-4">
                  <Link
                    to="/historial"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver todas las cotizaciones ({cotizaciones.length - 5} más) →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">🚀 Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/buscador"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="bg-blue-100 p-2 rounded-lg">
                <span className="text-blue-600 text-xl">🔍</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Nueva Cotización</h4>
                <p className="text-sm text-gray-600">Buscar materiales y crear cotización</p>
              </div>
            </Link>
            
            <Link
              to="/historial"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="bg-purple-100 p-2 rounded-lg">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Historial Completo</h4>
                <p className="text-sm text-gray-600">Ver todas las cotizaciones y base de datos</p>
              </div>
            </Link>
            
            <Link
              to="/demo-carrito"
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="bg-green-100 p-2 rounded-lg">
                <span className="text-green-600 text-xl">🛒</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Demo del Sistema</h4>
                <p className="text-sm text-gray-600">Probar con productos de ejemplo</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
