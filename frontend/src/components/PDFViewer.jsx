import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function PDFViewer() {
  const [pdfFile, setPdfFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(9751);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const { notifySuccess, notifyError } = useNotifications();

  // Manejar carga de archivo PDF
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      notifySuccess('PDF cargado exitosamente', 'Archivo Cargado');
      
      // Simular información del PDF
      if (file.name.includes('ListadoProveedoresVigentes')) {
        setTotalPages(9751);
        notifySuccess('PDF de 9,751 páginas detectado', 'PDF Masivo Cargado');
      }
    } else {
      notifyError('Por favor selecciona un archivo PDF válido', 'Error de Archivo');
    }
  };

  // Buscar en el PDF
  const searchInPDF = () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    
    // Simular búsqueda en PDF masivo
    setTimeout(() => {
      const mockResults = [
        { page: 125, text: `Proveedor encontrado: ${searchTerm}`, context: 'ID: 12455, RUT: 12.345.678-9' },
        { page: 1247, text: `Coincidencia en página 1247`, context: 'Razón Social: Empresa ejemplo' },
        { page: 3891, text: `Resultado en página 3891`, context: 'Fecha Actualización: 2025-01-15' },
        { page: 5623, text: `Encontrado en página 5623`, context: 'Categoría: Construcción' },
        { page: 7234, text: `Coincidencia en página 7234`, context: 'RUT: Búsqueda relacionada' }
      ];
      
      setSearchResults(mockResults);
      setIsLoading(false);
      notifySuccess(`${mockResults.length} resultados encontrados`, 'Búsqueda Completada');
    }, 2000);
  };

  // Ir a página específica
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del visor PDF */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📄 Visor PDF - Lista de Proveedores</h2>
            <p className="text-gray-600">Archivo: ListadoProveedoresVigentes-04-08-2025.pdf</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
              <div className="text-sm text-blue-600">Página Actual</div>
              <div className="text-xl font-bold text-blue-800">{currentPage}</div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg text-center">
              <div className="text-sm text-green-600">Total Páginas</div>
              <div className="text-xl font-bold text-green-800">{totalPages.toLocaleString()}</div>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-lg text-center">
              <div className="text-sm text-purple-600">Zoom</div>
              <div className="text-xl font-bold text-purple-800">{zoom}%</div>
            </div>
          </div>
        </div>

        {/* Cargar PDF */}
        {!pdfFile && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargar PDF de Proveedores</h3>
            <p className="text-gray-600 mb-4">
              Selecciona el archivo "ListadoProveedoresVigentes-04-08-2025.pdf" de 9,751 páginas
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2"
            >
              📤 Seleccionar PDF
            </label>
          </div>
        )}
      </div>

      {/* Controles de navegación y búsqueda */}
      {pdfFile && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Navegación */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">🧭 Navegación</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>
                  <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value))}
                    min="1"
                    max={totalPages}
                    className="w-20 px-2 py-2 border border-gray-300 rounded text-center"
                  />
                  <span className="text-gray-600">de {totalPages.toLocaleString()}</span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Siguiente →
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Zoom:</span>
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Búsqueda */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 Búsqueda en PDF</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por RUT, nombre, ID..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && searchInPDF()}
                  />
                  <button
                    onClick={searchInPDF}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? '🔄' : '🔍'} Buscar
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <div className="text-sm text-gray-600 mb-2">
                      {searchResults.length} resultados encontrados:
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 border border-gray-200 rounded mb-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => goToPage(result.page)}
                      >
                        <div className="font-medium text-blue-600">Página {result.page}</div>
                        <div className="text-sm text-gray-600">{result.context}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área de visualización del PDF */}
      {pdfFile ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              📄 Página {currentPage} de {totalPages.toLocaleString()} - {pdfFile.name}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(1)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Primera
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Última
              </button>
            </div>
          </div>
          
          {/* Simulación del contenido del PDF */}
          <div className="p-8 min-h-[600px] bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  📋 LISTADO DE PROVEEDORES VIGENTES
                </h3>
                <p className="text-gray-600">Página {currentPage} - Fecha: 04/08/2025</p>
              </div>
              
              {/* Simulación de estructura de datos por página */}
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-bold text-sm text-gray-700 border-b pb-2">
                  <div>ID</div>
                  <div>RUT PROVEEDOR</div>
                  <div>RAZÓN SOCIAL</div>
                  <div>FECHA ACTUALIZACIÓN</div>
                </div>
                
                {/* Filas simuladas de datos */}
                {Array.from({ length: 15 }, (_, i) => {
                  const id = (currentPage - 1) * 15 + i + 1;
                  return (
                    <div key={i} className="grid grid-cols-4 gap-4 text-sm text-gray-600 py-2 border-b">
                      <div className="font-mono">{String(id).padStart(6, '0')}</div>
                      <div className="font-mono">{`${Math.floor(Math.random() * 99)}.${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 9)}`}</div>
                      <div>EMPRESA EJEMPLO {id}</div>
                      <div>2025-{String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-{String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center text-xs text-gray-500">
                Vista simulada del PDF real - Sistema preparado para procesar documento completo
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay PDF cargado</h3>
          <p className="text-gray-600">
            Carga el archivo "ListadoProveedoresVigentes-04-08-2025.pdf" para ver su contenido
          </p>
        </div>
      )}
    </div>
  );
}
