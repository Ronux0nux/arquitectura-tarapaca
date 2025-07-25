import React, { useState, useRef } from 'react';
import { ProviderDataImporter } from '../utils/providerDataImporter';

const ImportarProveedores = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [processedProviders, setProcessedProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  // Procesar archivo PDF
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      if (selectedFile.type === 'application/pdf') {
        await extractTextFromPDF(selectedFile);
      } else if (selectedFile.type.includes('text')) {
        await extractTextFromTextFile(selectedFile);
      } else {
        alert('Por favor selecciona un archivo PDF o TXT');
        return;
      }
    } catch (error) {
      console.error('Error procesando archivo:', error);
      alert('Error al procesar el archivo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Extraer texto de PDF usando PDF.js
  const extractTextFromPDF = async (file) => {
    try {
      // Importar PDF.js dinámicamente
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      // Procesar páginas en lotes para manejar PDFs grandes
      const batchSize = 50; // Procesar 50 páginas a la vez
      
      for (let batch = 0; batch < Math.ceil(totalPages / batchSize); batch++) {
        const startPage = batch * batchSize + 1;
        const endPage = Math.min((batch + 1) * batchSize, totalPages);
        
        console.log(`Procesando páginas ${startPage} a ${endPage} de ${totalPages}`);
        
        const batchPromises = [];
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
          batchPromises.push(extractPageText(pdf, pageNum));
        }
        
        const batchTexts = await Promise.all(batchPromises);
        fullText += batchTexts.join('\n');
        
        // Actualizar progreso
        const progress = Math.round((endPage / totalPages) * 100);
        console.log(`Progreso: ${progress}%`);
      }
      
      setExtractedText(fullText);
      setActiveTab('preview');
      
    } catch (error) {
      throw new Error('Error extrayendo texto del PDF: ' + error.message);
    }
  };

  // Extraer texto de una página específica
  const extractPageText = async (pdf, pageNumber) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      return textContent.items.map(item => item.str).join(' ');
    } catch (error) {
      console.error(`Error en página ${pageNumber}:`, error);
      return '';
    }
  };

  // Extraer texto de archivo de texto plano
  const extractTextFromTextFile = async (file) => {
    const text = await file.text();
    setExtractedText(text);
    setActiveTab('preview');
  };

  // Procesar texto extraído para obtener proveedores
  const processExtractedData = () => {
    setLoading(true);
    try {
      const providers = ProviderDataImporter.processRawProviderData(extractedText);
      setProcessedProviders(providers);
      setActiveTab('results');
    } catch (error) {
      console.error('Error procesando datos:', error);
      alert('Error procesando los datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Importar proveedores al sistema
  const importProviders = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const provider of processedProviders) {
        try {
          const response = await fetch(`${API_BASE_URL}/providers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(provider)
          });

          if (response.ok) {
            results.successful++;
          } else {
            results.failed++;
            results.errors.push(`Error con ${provider.name}: ${response.statusText}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Error con ${provider.name}: ${error.message}`);
        }
      }

      setImportResults(results);
      setActiveTab('summary');
      
    } catch (error) {
      console.error('Error importando proveedores:', error);
      alert('Error durante la importación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar y reiniciar
  const resetImport = () => {
    setFile(null);
    setExtractedText('');
    setProcessedProviders([]);
    setImportResults(null);
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Importar Proveedores desde PDF</h1>
          <p className="text-gray-600">Extrae automáticamente información de proveedores desde archivos PDF grandes</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'upload', label: 'Subir Archivo', icon: '📄' },
                { id: 'preview', label: 'Vista Previa', icon: '👁️' },
                { id: 'results', label: `Proveedores (${processedProviders.length})`, icon: '🏢' },
                { id: 'summary', label: 'Resumen', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={
                    (tab.id === 'preview' && !extractedText) ||
                    (tab.id === 'results' && processedProviders.length === 0) ||
                    (tab.id === 'summary' && !importResults)
                  }
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona tu archivo PDF de proveedores
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Soportamos archivos PDF de hasta 10,000+ páginas y archivos de texto plano
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Procesando...' : 'Seleccionar Archivo'}
                  </button>
                </div>

                {file && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{file.name}</p>
                        <p className="text-sm text-blue-700">
                          Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">💡 Consejos para mejores resultados:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Asegúrate de que el PDF contenga texto seleccionable (no solo imágenes)</li>
                    <li>• Los datos deben estar organizados en filas, una por proveedor</li>
                    <li>• Incluye información como: nombre, teléfono, email, dirección</li>
                    <li>• Para PDFs muy grandes (+5000 páginas), considera dividir en archivos más pequeños</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Preview */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Texto Extraído</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={processExtractedData}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      {loading ? 'Procesando...' : 'Procesar Datos'}
                    </button>
                    <button
                      onClick={resetImport}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Reiniciar
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {extractedText ? 
                      extractedText.substring(0, 2000) + (extractedText.length > 2000 ? '\n\n... (texto truncado, mostrando primeros 2000 caracteres)' : '')
                      : 'No hay texto extraído'
                    }
                  </pre>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Caracteres extraídos:</strong> {extractedText.length.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Results */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Proveedores Procesados</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={importProviders}
                      disabled={loading || processedProviders.length === 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {loading ? 'Importando...' : `Importar ${processedProviders.length} Proveedores`}
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Volver a Editar
                    </button>
                  </div>
                </div>

                {processedProviders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No se encontraron proveedores. Verifica el formato de los datos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {processedProviders.slice(0, 50).map((provider, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{provider.icon}</span>
                          <h4 className="font-semibold text-gray-900 truncate">{provider.name}</h4>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {provider.phone && <p>📞 {provider.phone}</p>}
                          {provider.email && <p>📧 {provider.email}</p>}
                          {provider.address && <p>📍 {provider.address}</p>}
                        </div>
                      </div>
                    ))}
                    {processedProviders.length > 50 && (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        ... y {processedProviders.length - 50} proveedores más
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Summary */}
            {activeTab === 'summary' && importResults && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Resumen de Importación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{importResults.successful}</div>
                    <p className="text-green-800">Proveedores Importados</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-red-600">{importResults.failed}</div>
                    <p className="text-red-800">Fallos</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{processedProviders.length}</div>
                    <p className="text-blue-800">Total Procesados</p>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Errores encontrados:</h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      {importResults.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResults.errors.length > 10 && (
                        <li>... y {importResults.errors.length - 10} errores más</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={resetImport}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Importar Otro Archivo
                  </button>
                  <a
                    href="/providers"
                    className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors inline-block"
                  >
                    Ver Proveedores Importados
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportarProveedores;
