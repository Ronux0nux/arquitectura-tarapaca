import React, { useState, useEffect } from 'react';

export default function CSVProvidersTest() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      console.log('Intentando cargar proveedores...');
      
      const response = await fetch('http://localhost:5000/api/csv-providers');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      if (data.success) {
        setProviders(data.data);
        console.log('Providers set:', data.data.length);
      } else {
        setError('No se pudieron cargar los datos');
      }
    } catch (err) {
      console.error('Error loading providers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-2xl mb-4">⏳ Cargando...</div>
        <p>Intentando conectar con el backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg">
        <div className="text-2xl mb-4">❌ Error</div>
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={loadProviders}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Test de Proveedores CSV</h2>
      
      {providers.length === 0 ? (
        <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl mb-4">📭</div>
          <p>No se encontraron proveedores</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✅ Se cargaron {providers.length} proveedores exitosamente
            </p>
          </div>
          
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">RUT</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Archivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {providers.slice(0, 10).map((provider, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{provider.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{provider.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{provider.rut || 'No disponible'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{provider.fileName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {providers.length > 10 && (
              <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
                Mostrando primeros 10 de {providers.length} proveedores
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
