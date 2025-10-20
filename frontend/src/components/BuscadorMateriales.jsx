import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useCotizaciones } from '../context/CotizacionesContext';
import { formatPrice } from '../utils/priceUtils';

const BuscadorMateriales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatabaseResults, setShowDatabaseResults] = useState(false);
  const { addToCart } = useCart();
  const { buscarEnDatabase, getProductosMasUsados } = useCotizaciones();

  // URL del API backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Función para guardar resultados en el dataset automáticamente
  const guardarResultadosEnDataset = async (resultados, terminoBusqueda) => {
    if (!resultados || resultados.length === 0) return;

    // Guardar en localStorage (mantener funcionalidad existente)
    const savedProductos = localStorage.getItem('productos_database');
    let productosExistentes = savedProductos ? JSON.parse(savedProductos) : [];

    // Procesar cada resultado de SERPAPI
    resultados.forEach(resultado => {
      // Verificar si el producto ya existe
      const existe = productosExistentes.find(p => 
        p.title === resultado.title && p.source === resultado.source
      );
      
      if (!existe) {
        // Agregar nuevo producto al dataset
        const nuevoProducto = {
          ...resultado,
          id: Date.now() + Math.random(),
          fechaAgregado: new Date().toISOString(),
          vecesUsado: 1,
          ultimoUso: new Date().toISOString(),
          searchTerm: terminoBusqueda, // Guardar el término de búsqueda
          category: 'Productos', // Siempre será productos
          origenBusqueda: 'SERPAPI' // Marcar que viene de SERPAPI
        };
        productosExistentes.push(nuevoProducto);
      } else {
        // Actualizar producto existente
        existe.vecesUsado = (existe.vecesUsado || 1) + 1;
        existe.ultimoUso = new Date().toISOString();
        // Actualizar precio si es más reciente y está disponible
        if (resultado.price && resultado.price !== 'Precio no disponible') {
          existe.price = resultado.price;
        }
      }
    });

    // Guardar en localStorage
    localStorage.setItem('productos_database', JSON.stringify(productosExistentes));

    // También guardar en backend (base de datos)
    try {
      await axios.post(`${API_BASE_URL}/dataset/save-search-results`, {
        searchTerm: terminoBusqueda,
        searchType: 'shopping', // Siempre shopping
        results: resultados
      });
    } catch (error) {
      console.warn('Error guardando en backend, solo se guardó en localStorage:', error);
    }
    
    // Mostrar notificación de guardado
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = `💾 ${resultados.length} productos guardados en dataset`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const searchMaterials = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    // SIEMPRE buscar en SerpAPI (ignorar BD local)
    // const databaseResults = buscarEnDatabase(searchTerm);
    // 
    // if (databaseResults.length > 0) {
    //   setShowDatabaseResults(true);
    //   setResults(databaseResults);
    //   setError('');
    //   return;
    // }

    // Buscar en SerpApi
    setShowDatabaseResults(false);
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/search/search`, {
        searchTerm: searchTerm.trim(),
        searchType: 'shopping' // Siempre buscar productos
      });

      if (response.data.results) {
        setResults(response.data.results);
        
        // 🔥 NUEVO: Guardar automáticamente todos los resultados en el dataset
        await guardarResultadosEnDataset(response.data.results, searchTerm.trim());
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error en la búsqueda:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Verifica que SerpApi esté configurado correctamente.');
      } else {
        setError('Error al realizar la búsqueda. Verifica tu conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMaterials();
    }
  };

  const handleLinkClick = (url, product) => {
    if (url && url.startsWith('http')) {
      try {
        console.log('🔗 Abriendo link:', url);
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error al abrir el enlace:', error);
        // Fallback: intentar navegar directamente
        try {
          window.location.href = url;
        } catch (e) {
          console.error('Error incluso con fallback:', e);
        }
      }
    } else if (url) {
      // Si el URL no es válido, intentar crearlo desde el nombre del producto
      const searchQuery = encodeURIComponent(product?.title || url);
      const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
      console.log('🔗 URL inválida, abriendo búsqueda de Google:', searchUrl);
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('⚠️ No hay enlace disponible para este resultado:', product?.title);
      // Último recurso: búsqueda en Google del producto
      if (product?.title) {
        const searchQuery = encodeURIComponent(product.title);
        const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleAddToCart = (result) => {
    const itemWithSearch = {
      ...result,
      searchTerm: searchTerm,
      category: 'Productos' // Siempre será productos
    };
    addToCart(itemWithSearch);
    
    // Mostrar notificación
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = showDatabaseResults ? '✓ Producto agregado desde base de datos' : '✓ Producto agregado al carrito';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Mostrar notificación
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = '📋 Información copiada';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Buscador de Materiales</h2>
        
        {/* Controles de búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Buscar materiales de construcción (ej: cemento, acero, ladrillos)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={searchMaterials}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Buscando...
                </>
              ) : (
                '🔍 Buscar Productos'
              )}
            </button>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Información sobre la configuración */}
        {error.includes('SerpApi') && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">⚠️ Configuración de SerpApi requerida:</p>
            <p>Para usar el buscador, el administrador debe:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Crear una cuenta en <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">SerpApi</a></li>
              <li>Obtener la API Key gratuita</li>
              <li>Configurar la variable <code className="bg-gray-200 px-1 rounded">SERPAPI_KEY</code> en el servidor</li>
            </ol>
          </div>
        )}
      </div>

      {/* Productos más usados */}
      {!loading && results.length === 0 && !searchTerm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🚨 Productos Más Usados en tus Cotizaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getProductosMasUsados(6).map((producto, index) => (
              <div key={producto.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-800 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {producto.title}
                  </h4>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(producto.price) || 'Consultar'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {producto.source}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Usado {producto.vecesUsado || 1} veces
                    </span>
                    <button
                      onClick={() => handleAddToCart(producto)}
                      className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      🛒 Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {getProductosMasUsados().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No tienes productos en tu base de datos aún</p>
              <p className="text-gray-400 text-sm mt-2">
                Busca y exporta cotizaciones para crear tu base de datos
              </p>
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {showDatabaseResults ? (
              <span className="flex items-center gap-2">
                🗄️ Resultados de tu base de datos ({results.length})
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  Productos previamente usados
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🌐 Resultados de búsqueda en internet ({results.length})
                <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  💾 Guardado automáticamente en dataset
                </span>
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <div key={result.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {showDatabaseResults ? (
                  // Card para resultados de base de datos
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-800 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {result.title}
                    </h4>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(result.price) || 'Consultar'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {result.source}
                    </p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        Usado {result.vecesUsado || 1} veces
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {result.category || 'General'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddToCart(result)}
                        className="bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        🛒 Carrito
                      </button>
                      <button
                        onClick={() => copyToClipboard(`${result.title} - ${result.price} - ${result.source}`)}
                        className="bg-gray-600 text-white py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        📋 Copiar detalles
                      </button>
                    </div>
                  </div>
                ) : (
                  // Cards para resultados de internet (siempre productos)
                  <div className="space-y-3">
                    {result.thumbnail && (
                      <img 
                        src={result.thumbnail} 
                        alt={result.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <h4 className="font-semibold text-sm text-gray-800 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {result.title}
                    </h4>
                    {result.price && (
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(result.price)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {result.source}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleAddToCart(result)}
                        className="bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        🛒 Carrito
                      </button>
                      <button
                        onClick={() => copyToClipboard(`${result.title} - ${result.price} - ${result.source}`)}
                        className="bg-gray-600 text-white py-2 px-3 rounded-md hover:bg-gray-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        📋 Copiar detalles
                      </button>
                      <button
                        onClick={() => handleLinkClick(result.link, result)}
                        className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        🔍 Buscar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Buscando materiales...</p>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && results.length === 0 && searchTerm && !error && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No se encontraron resultados para "{searchTerm}"</p>
          <p className="text-sm text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Consejos para mejores búsquedas:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Usa términos específicos: "cemento portland", "acero estructural", "ladrillos cerámicos"</li>
          <li>• El buscador encuentra productos con precios y proveedores</li>
          <li>• Los resultados incluyen precios y proveedores de Chile</li>
          <li>• Puedes comparar precios entre diferentes proveedores</li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <h5 className="font-semibold text-blue-800 mb-1">🛒 Sistema Inteligente de Cotizaciones</h5>
          <p className="text-sm text-blue-700">
            • Primero busca en tu base de datos de productos ya usados<br/>
            • Si no encuentra, busca productos en internet con los API<br/>
            • Cada cotización exportada mejora tu base de datos<br/>
            • Accede al historial completo desde la barra superior
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuscadorMateriales;
