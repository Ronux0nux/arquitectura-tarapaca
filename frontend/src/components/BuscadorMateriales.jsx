import React, { useState } from 'react';
import axios from 'axios';

const BuscadorMateriales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('shopping');

  // URL del API backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const searchMaterials = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/search/search`, {
        searchTerm: searchTerm.trim(),
        searchType
      });

      if (response.data.results) {
        setResults(response.data.results);
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
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="shopping">Productos</option>
              <option value="organic">Información</option>
            </select>
            
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
                '🔍 Buscar'
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

      {/* Resultados */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Resultados de búsqueda ({results.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {result.type === 'shopping' ? (
                  // Card para resultados de shopping
                  <div className="space-y-3">
                    {result.thumbnail && (
                      <img 
                        src={result.thumbnail} 
                        alt={result.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-2">
                      {result.title}
                    </h4>
                    {result.price && (
                      <p className="text-lg font-bold text-green-600">
                        {result.price}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {result.source}
                    </p>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Ver producto
                    </a>
                  </div>
                ) : (
                  // Card para resultados orgánicos
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-blue-600 hover:text-blue-800">
                      <a href={result.link} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {result.snippet}
                    </p>
                    <p className="text-xs text-green-600">
                      {result.source}
                    </p>
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                      Ver información
                    </a>
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
          <li>• Cambia entre "Productos" e "Información" según lo que necesites</li>
          <li>• Los resultados incluyen precios y proveedores de Chile</li>
          <li>• Puedes comparar precios entre diferentes proveedores</li>
        </ul>
      </div>
    </div>
  );
};

export default BuscadorMateriales;
