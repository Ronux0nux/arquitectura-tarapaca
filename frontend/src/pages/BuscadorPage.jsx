import React, { useState } from 'react';
import BuscadorMateriales from '../components/BuscadorMateriales';
import { useCotizaciones } from '../context/CotizacionesContext';
import { useCart } from '../context/CartContext';

const BuscadorPage = () => {
  const [activeTab, setActiveTab] = useState('buscar');
  const { productosDatabase, getProductosMasUsados, getProductosRecientes } = useCotizaciones();
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    if (!price || price === 'Precio no disponible') return 'Precio no disponible';
    if (typeof price === 'string' && price.includes('$')) return price;
    return `$${price}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const handleAddToCart = (producto) => {
    addToCart({
      id: producto.id,
      title: producto.title,
      price: producto.price,
      source: producto.source,
      image: producto.image,
      link: producto.link
    });
  };

  const ProductCard = ({ producto, showStats = false }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {producto.image && (
          <img 
            src={producto.image} 
            alt={producto.title}
            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {producto.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{producto.source}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-green-600">
              {formatPrice(producto.price)}
            </span>
            {showStats && (
              <div className="text-xs text-gray-500">
                <span>Usado {producto.vecesUsado || 1} veces</span>
                <br />
                <span>Último uso: {formatDate(producto.ultimoUso)}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleAddToCart(producto)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Agregar al Carrito
            </button>
            {producto.link && (
              <a
                href={producto.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ver
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Buscador de Materiales</h1>
          <p className="text-gray-600">Encuentra materiales de construcción y gestiona tu historial de productos</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'buscar', label: 'Buscar Materiales' },
                { id: 'historial', label: `Historial (${productosDatabase.length})` },
                { id: 'mas-usados', label: 'Más Usados' },
                { id: 'recientes', label: 'Recientes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Buscar */}
            {activeTab === 'buscar' && (
              <BuscadorMateriales />
            )}

            {/* Tab: Historial */}
            {activeTab === 'historial' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Todos los Productos Guardados</h3>
                  <span className="text-sm text-gray-500">
                    {productosDatabase.length} productos en total
                  </span>
                </div>
                
                {productosDatabase.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos guardados</h3>
                    <p className="text-gray-500 mb-4">
                      Busca materiales y agrégalos al carrito para que aparezcan en tu historial
                    </p>
                    <button
                      onClick={() => setActiveTab('buscar')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Comenzar a Buscar
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productosDatabase.map((producto) => (
                      <ProductCard key={producto.id} producto={producto} showStats={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Más Usados */}
            {activeTab === 'mas-usados' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Productos Más Utilizados</h3>
                  <span className="text-sm text-gray-500">
                    Ordenados por frecuencia de uso
                  </span>
                </div>
                
                {getProductosMasUsados(10).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estadísticas aún</h3>
                    <p className="text-gray-500">
                      Usa el buscador varias veces para ver qué productos utilizas más
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getProductosMasUsados(10).map((producto, index) => (
                      <div key={producto.id} className="relative">
                        {index < 3 && (
                          <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold z-10 ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-600'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        <ProductCard producto={producto} showStats={true} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Recientes */}
            {activeTab === 'recientes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Productos Utilizados Recientemente</h3>
                  <span className="text-sm text-gray-500">
                    Últimos productos utilizados
                  </span>
                </div>
                
                {getProductosRecientes(10).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividad reciente</h3>
                    <p className="text-gray-500">
                      Los productos que uses aparecerán aquí ordenados por fecha
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getProductosRecientes(10).map((producto) => (
                      <ProductCard key={producto.id} producto={producto} showStats={true} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuscadorPage;
