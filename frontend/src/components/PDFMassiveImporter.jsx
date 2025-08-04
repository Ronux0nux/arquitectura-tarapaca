import React, { useState, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import PDFMassiveService from '../services/PDFMassiveService';

export default function PDFMassiveImporter() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [searchPage, setSearchPage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageContent, setPageContent] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const fileInputRef = useRef(null);
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Procesar PDF masivo
  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      notifyError('Por favor selecciona un archivo PDF válido');
      return;
    }

    setIsProcessing(true);
    
    try {
      notifyInfo(`Procesando PDF de ${(file.size / 1024 / 1024).toFixed(2)}MB...`);
      
      const processedData = await PDFMassiveService.processPDFFile(file);
      setPdfData(processedData);
      
      // Cargar estadísticas
      const stats = PDFMassiveService.getStatistics();
      setStatistics(stats);
      
      notifySuccess(`PDF procesado exitosamente: ${processedData.totalPages.toLocaleString()} páginas indexadas`);
      
    } catch (error) {
      notifyError(`Error procesando PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Buscar por número de página
  const searchByPageNumber = () => {
    if (!pdfData || !searchPage) {
      notifyError('Ingresa un número de página válido');
      return;
    }

    const pageNum = parseInt(searchPage);
    
    if (pageNum < 1 || pageNum > pdfData.totalPages) {
      notifyError(`Número de página debe estar entre 1 y ${pdfData.totalPages.toLocaleString()}`);
      return;
    }

    const pageData = PDFMassiveService.getPage(pageNum);
    if (pageData) {
      setCurrentPage(pageNum);
      setPageContent(pageData.content);
      setSearchResults([{
        page: pageNum,
        section: pageData.section,
        companies: pageData.companies,
        matches: [{ type: 'direct', text: 'Navegación directa' }],
        relevance: 100
      }]);
      
      notifySuccess(`Página ${pageNum.toLocaleString()} encontrada`);
    } else {
      notifyError(`No se encontró contenido para la página ${pageNum}`);
    }
  };

  // Buscar por texto
  const searchByText = () => {
    if (!pdfData || !searchText.trim()) {
      notifyError('Ingresa un término de búsqueda');
      return;
    }

    const options = {
      section: selectedSection || null,
      limit: 50,
      includeContext: true
    };

    const results = PDFMassiveService.searchContent(searchText, options);
    setSearchResults(results);
    
    if (results.length > 0) {
      notifySuccess(`${results.length} resultados encontrados`);
      // Mostrar primera página encontrada
      const firstResult = results[0];
      setCurrentPage(firstResult.page);
      const pageData = PDFMassiveService.getPage(firstResult.page);
      setPageContent(pageData ? pageData.content : `Página ${firstResult.page} - ${firstResult.section}`);
    } else {
      notifyError('No se encontraron resultados');
    }
  };

  // Navegar a página específica
  const goToPage = (pageNum) => {
    const pageData = PDFMassiveService.getPage(pageNum);
    if (pageData) {
      setCurrentPage(pageNum);
      setPageContent(pageData.content);
      setSearchPage(pageNum.toString());
    }
  };

  // Cargar datos guardados al montar el componente
  React.useEffect(() => {
    const savedData = PDFMassiveService.loadPDFData();
    if (savedData) {
      setPdfData(savedData);
      const stats = PDFMassiveService.getStatistics();
      setStatistics(stats);
      // PDF previamente cargado sin notificación automática
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Importador de PDF Masivo</h2>
        <p className="text-gray-600 mb-4">
          Carga PDFs grandes (hasta 9693+ páginas) y busca por número de página o contenido
        </p>
        
        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo PDF
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              disabled={isProcessing}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {isProcessing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Procesando PDF...</span>
            </div>
          )}
          
          {pdfData && (
            <div className="mt-3">
              <button
                onClick={() => {
                  PDFMassiveService.clearPDFData();
                  setPdfData(null);
                  setStatistics(null);
                  setSearchResults([]);
                  setPageContent('');
                  setCurrentPage(1);
                  notifyInfo('Datos del PDF eliminados');
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                🗑️ Limpiar PDF Cargado
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Info */}
      {pdfData && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Información del PDF</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">Archivo</div>
              <div className="font-medium text-blue-800">{pdfData.fileName}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600">Total Páginas</div>
              <div className="font-medium text-green-800">{pdfData.totalPages.toLocaleString()}</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-sm text-yellow-600">Tamaño</div>
              <div className="font-medium text-yellow-800">
                {(pdfData.originalSize / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600">Procesado</div>
              <div className="font-medium text-purple-800">
                {new Date(pdfData.processDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Estadísticas adicionales */}
          {statistics && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-indigo-50 p-2 rounded text-center">
                <div className="text-xs text-indigo-600">Total Empresas</div>
                <div className="font-bold text-indigo-800">{statistics.totalCompanies.toLocaleString()}</div>
              </div>
              <div className="bg-teal-50 p-2 rounded text-center">
                <div className="text-xs text-teal-600">Secciones</div>
                <div className="font-bold text-teal-800">{Object.keys(statistics.sectionBreakdown).length}</div>
              </div>
              <div className="bg-orange-50 p-2 rounded text-center">
                <div className="text-xs text-orange-600">Promedio/Página</div>
                <div className="font-bold text-orange-800">
                  {(statistics.totalCompanies / statistics.totalPages).toFixed(1)}
                </div>
              </div>
              <div className="bg-pink-50 p-2 rounded text-center">
                <div className="text-xs text-pink-600">Versión</div>
                <div className="font-bold text-pink-800">{pdfData.version}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Section */}
      {pdfData && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Búsqueda en PDF</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Búsqueda por número de página */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Número de Página
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  max={pdfData.totalPages}
                  value={searchPage}
                  onChange={(e) => setSearchPage(e.target.value)}
                  placeholder={`1 - ${pdfData.totalPages.toLocaleString()}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={searchByPageNumber}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ir
                </button>
              </div>
            </div>

            {/* Búsqueda por texto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Contenido
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar texto en el PDF..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      searchByText();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={searchByText}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Filtro por sección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Sección
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las secciones</option>
                <option value="index">📑 Índice General</option>
                <option value="providers_a_d">🏢 Proveedores A-D</option>
                <option value="providers_e_h">🏬 Proveedores E-H</option>
                <option value="providers_i_l">🏭 Proveedores I-L</option>
                <option value="providers_m_p">🏪 Proveedores M-P</option>
                <option value="providers_q_t">🏫 Proveedores Q-T</option>
                <option value="providers_u_z">🏛️ Proveedores U-Z</option>
                <option value="annexes">📎 Anexos</option>
                <option value="references">📚 Referencias</option>
              </select>
            </div>
          </div>

          {/* Búsqueda rápida por categorías */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsquedas Rápidas
            </label>
            <div className="flex flex-wrap gap-2">
              {['Construcción', 'Materiales', 'Electricidad', 'Plomería', 'Transporte', 'Ingeniería'].map(term => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchText(term);
                    setTimeout(() => searchByText(), 100);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Current Page Display */}
      {pageContent && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              📄 Página {currentPage}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                ← Anterior
              </button>
              <button
                onClick={() => goToPage(Math.min(pdfData?.totalPages || 1, currentPage + 1))}
                disabled={currentPage >= (pdfData?.totalPages || 1)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Contenido de la página:</div>
            <div className="text-gray-800">{pageContent}</div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Resultados de Búsqueda ({searchResults.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.slice(0, 20).map((result, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => goToPage(result.page)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="font-medium text-blue-600">
                      📄 Página {result.page.toLocaleString()}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      result.section === 'providers_a_d' ? 'bg-blue-100 text-blue-800' :
                      result.section === 'providers_e_h' ? 'bg-green-100 text-green-800' :
                      result.section === 'providers_i_l' ? 'bg-yellow-100 text-yellow-800' :
                      result.section === 'providers_m_p' ? 'bg-purple-100 text-purple-800' :
                      result.section === 'providers_q_t' ? 'bg-pink-100 text-pink-800' :
                      result.section === 'providers_u_z' ? 'bg-indigo-100 text-indigo-800' :
                      result.section === 'index' ? 'bg-gray-100 text-gray-800' :
                      result.section === 'annexes' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.section.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Relevancia: {result.relevance}
                    </div>
                  </div>
                </div>
                
                {/* Mostrar empresas encontradas */}
                {result.companies && result.companies.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Empresas en esta página ({result.companies.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.companies.slice(0, 3).map((company, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {company}
                        </span>
                      ))}
                      {result.companies.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{result.companies.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Mostrar coincidencias */}
                {result.matches && result.matches.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Coincidencias encontradas:
                    </div>
                    <div className="space-y-1">
                      {result.matches.slice(0, 2).map((match, idx) => (
                        <div key={idx} className="text-xs">
                          <span className={`inline-block px-1 rounded ${
                            match.type === 'company' ? 'bg-green-100 text-green-800' :
                            match.type === 'content' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.type.toUpperCase()}
                          </span>
                          <span className="ml-2 text-gray-600">
                            {match.text.length > 80 ? match.text.substring(0, 80) + '...' : match.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Mostrar contexto */}
                {result.context && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Contexto:</strong> {result.context}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {searchResults.length > 20 && (
            <div className="mt-4 text-center">
              <div className="text-gray-500 text-sm mb-2">
                Mostrando primeros 20 resultados de {searchResults.length}
              </div>
              <button
                onClick={() => {
                  // Aquí podrías implementar paginación
                  notifyInfo('Funcionalidad de paginación próximamente');
                }}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                Ver más resultados →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
