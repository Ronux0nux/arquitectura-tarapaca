import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import ProviderDataImporter from '../utils/providerDataImporter';
import CSVProviders from '../components/CSVProviders';
import ProjectIntegrationSummary from '../components/ProjectIntegrationSummary';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importType, setImportType] = useState('text');
  const [activeTab, setActiveTab] = useState('integration'); // Nueva pestaña por defecto
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  useEffect(() => {
    // Cargar proveedores importados si existen
    const importedProviders = ProviderDataImporter.loadProvidersFromLocalStorage();
    if (importedProviders.length > 0) {
      setProviders(importedProviders);
      notifyInfo(`Se cargaron ${importedProviders.length} proveedores desde datos importados`, 'Datos Cargados');
    } else {
      // Inicializar con arreglo vacío
      setProviders([]);
    }
  }, [notifyInfo]);

  const handleExportData = () => {
    const dataToExport = {
      providers: providers,
      exportDate: new Date().toISOString(),
      totalProviders: providers.length
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proveedores_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    notifySuccess('Datos exportados exitosamente', 'Exportación Completada');
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('importedProviders');
    localStorage.removeItem('providersImportDate');
    setProviders([]);
    notifyInfo('Se limpiaron todos los proveedores importados', 'Datos Limpiados');
  };

  const handleImportData = () => {
    if (!importData.trim()) {
      notifyError('Por favor ingresa los datos a importar', 'Error de Importación');
      return;
    }

    try {
      let newProviders = [];
      
      switch (importType) {
        case 'text':
          newProviders = ProviderDataImporter.processRawProviderData(importData);
          break;
        case 'csv':
          newProviders = ProviderDataImporter.processCsvProviderData(importData);
          break;
        case 'json':
          newProviders = ProviderDataImporter.processJsonProviderData(importData);
          break;
        default:
          notifyError('Tipo de importación no válido', 'Error de Importación');
          return;
      }

      // Validar datos
      const validation = ProviderDataImporter.validateProviders(newProviders);
      
      if (!validation.isValid) {
        notifyError(`Errores encontrados: ${validation.errors.join(', ')}`, 'Error de Validación');
        return;
      }

      if (validation.warnings.length > 0) {
        notifyInfo(`Advertencias: ${validation.warnings.join(', ')}`, 'Advertencias de Importación');
      }

      // Guardar y actualizar
      ProviderDataImporter.saveProvidersToLocalStorage(newProviders);
      setProviders(newProviders);
      
      notifySuccess(`Se importaron ${validation.validProviders} proveedores exitosamente`, 'Importación Completada');
      setShowImportModal(false);
      setImportData('');
      
    } catch (error) {
      notifyError(`Error al procesar datos: ${error.message}`, 'Error de Importación');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800">🏢 Gestión de Proveedores</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Importar PDF/Excel
            </button>
            <button
              onClick={handleExportData}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </button>
            <button
              onClick={handleResetToDefault}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar Importados
            </button>
          </div>
        </div>
        <p className="text-gray-600">Gestiona los proveedores importados desde archivos CSV de cotizaciones</p>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('integration')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'integration'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Integración de Proyectos
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'management'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏢 Gestión de Proveedores
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'integration' && (
        <ProjectIntegrationSummary />
      )}

      {activeTab === 'management' && (
        <CSVProviders />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">📄 Importar Datos de Proveedores</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Formato de Datos</h3>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="text"
                        checked={importType === 'text'}
                        onChange={(e) => setImportType(e.target.value)}
                        className="mr-2"
                      />
                      Texto del PDF
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="csv"
                        checked={importType === 'csv'}
                        onChange={(e) => setImportType(e.target.value)}
                        className="mr-2"
                      />
                      CSV
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="json"
                        checked={importType === 'json'}
                        onChange={(e) => setImportType(e.target.value)}
                        className="mr-2"
                      />
                      JSON
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Instrucciones</h3>
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    {importType === 'text' && (
                      <div>
                        <p className="mb-2"><strong>Para texto del PDF:</strong></p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Abre el archivo PDF "ListadoProveedoresVigentes-01-07-2025.pdf"</li>
                          <li>Selecciona todo el texto (Ctrl+A) y cópialo (Ctrl+C)</li>
                          <li>Pega el contenido en el área de texto abajo</li>
                          <li>El sistema detectará automáticamente nombres, teléfonos, emails y direcciones</li>
                        </ol>
                      </div>
                    )}
                    {importType === 'csv' && (
                      <div>
                        <p className="mb-2"><strong>Para CSV:</strong></p>
                        <p>Formato: Nombre,Teléfono,Email,Dirección,Sitio Web,Categorías,Descripción</p>
                        <p className="mt-2">Las categorías deben estar separadas por ";"</p>
                      </div>
                    )}
                    {importType === 'json' && (
                      <div>
                        <p className="mb-2"><strong>Para JSON:</strong></p>
                        <p>Array de objetos con propiedades: nombre, telefono, email, direccion, categorias, etc.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Datos a Importar</h3>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder={importType === 'text' ? "Pega aquí el contenido del PDF..." : 
                                importType === 'csv' ? "Pega aquí los datos CSV..." : 
                                "Pega aquí los datos JSON..."}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImportData}
                    disabled={!importData.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Importar Datos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
