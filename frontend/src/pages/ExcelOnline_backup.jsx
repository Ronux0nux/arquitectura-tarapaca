import React, { useState, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import '../components/ExcelOnline.css';
import axios from 'axios';
import { useCotizaciones } from '../context/CotizacionesContext';
import { useCart } from '../context/CartContext';
import ProjectExcelService from '../services/ProjectExcelService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ExcelOnline = () => {
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [showDatasetPanel, setShowDatasetPanel] = useState(false);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(true); // Nuevo panel para proyectos
  const [selectedProject, setSelectedProject] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [projectExcelData, setProjectExcelData] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  
  const { productosDatabase } = useCotizaciones();
  const { cartItems } = useCart();

  // Configuración de Handsontable por tipo de hoja
  const getSheetConfig = (sheetName) => {
    const baseName = sheetName?.toLowerCase() || '';
    
    if (baseName.includes('ppto') || baseName.includes('presupuesto')) {
      return {
        colHeaders: ['Item', 'Descripción', 'Cantidad', 'Precio Unit.', 'Precio Total', 'Proveedor', 'Categoría'],
        columns: [
          { type: 'text', width: 60 },
          { type: 'text', width: 300 },
          { type: 'text', width: 80 },
          { type: 'text', width: 100 },
          { type: 'text', width: 100 },
          { type: 'text', width: 150 },
          { type: 'text', width: 120 }
        ]
      };
    }
    
    if (baseName.includes('apu') || baseName.includes('análisis')) {
      return {
        colHeaders: ['Descripción', 'Tipo', 'Cantidad', 'Unidad', 'Precio Unit.', 'Precio Total', 'Proveedor'],
        columns: [
          { type: 'text', width: 300 },
          { type: 'dropdown', source: ['MATERIAL', 'MANO DE OBRA', 'EQUIPO', 'SUBCONTRATO'], width: 120 },
          { type: 'text', width: 80 },
          { type: 'dropdown', source: ['UND', 'M2', 'M3', 'KG', 'TON', 'ML', 'GL'], width: 80 },
          { type: 'text', width: 100 },
          { type: 'text', width: 100 },
          { type: 'text', width: 150 }
        ]
      };
    }
    
    if (baseName.includes('recursos') || baseName.includes('materiales')) {
      return {
        colHeaders: ['Descripción', 'Proveedor', 'Precio', 'Categoría', 'Fecha', 'Origen'],
        columns: [
          { type: 'text', width: 300 },
          { type: 'text', width: 150 },
          { type: 'text', width: 100 },
          { type: 'text', width: 120 },
          { type: 'text', width: 100 },
          { type: 'dropdown', source: ['SERPAPI', 'Manual', 'Importado'], width: 100 }
        ]
      };
    }
    
    // Configuración por defecto
    return {
      colHeaders: true,
      columns: [
        { type: 'text', width: 150 },
        { type: 'text', width: 150 },
        { type: 'text', width: 150 },
        { type: 'text', width: 150 },
        { type: 'text', width: 150 }
      ]
    };
  };

  // Inicializar componente
  useEffect(() => {
    initializeComponent();
  }, []);

  // Inicializar datos del componente
  const initializeComponent = async () => {
    setLoading(true);
    try {
      // Cargar plantillas disponibles
      const templates = ProjectExcelService.getAvailableTemplates();
      setAvailableTemplates(templates);
      
      // Cargar proyectos
      await loadProjects();
      
      // Inicializar plantillas locales como fallback
      initializeLocalTemplates();
      
    } catch (error) {
      console.error('Error inicializando componente:', error);
      initializeLocalTemplates(); // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Cargar proyectos desde el servicio
  const loadProjects = async () => {
    try {
      const response = await ProjectExcelService.getAllProjects();
      if (response.success) {
        setProyectos(response.data);
        console.log(`✅ ${response.data.length} proyectos cargados (fuente: ${response.source})`);
      }
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  // Manejar selección de proyecto
  const handleProjectSelection = async (projectId) => {
    if (!projectId) {
      setSelectedProject('');
      setProjectExcelData(null);
      return;
    }

    setLoading(true);
    try {
      console.log('🏗️ Cargando datos Excel para proyecto:', projectId);
      
      const response = await ProjectExcelService.generateProjectExcelData(projectId);
      
      if (response.success) {
        setSelectedProject(projectId);
        setProjectExcelData(response.data);
        
        // Configurar hojas del Excel basadas en el proyecto
        const sheets = Object.keys(response.data.sheets);
        setSheetNames(sheets);
        setActiveSheet(0);
        
        // Configurar datos de la primera hoja
        if (sheets.length > 0) {
          const firstSheet = response.data.sheets[sheets[0]];
          setExcelData(firstSheet.data);
        }
        
        console.log(`✅ Datos Excel generados para proyecto: ${response.data.project.name}`);
      } else {
        throw new Error('No se pudieron generar datos del proyecto');
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos del proyecto:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar hoja activa
  const handleSheetChange = (sheetIndex) => {
    if (projectExcelData && projectExcelData.sheets) {
      const sheetName = sheetNames[sheetIndex];
      const sheetData = projectExcelData.sheets[sheetName];
      
      if (sheetData) {
        setActiveSheet(sheetIndex);
        setExcelData(sheetData.data);
      }
    } else {
      // Comportamiento original para plantillas locales
      setActiveSheet(sheetIndex);
    }
  };

  // Inicializar plantillas localmente (sin cargar archivos) - FALLBACK
  const initializeLocalTemplates = () => {
    setLoading(true);
    try {
      // Crear plantillas vacías localmente
      const templates = {
        'PRESUPUESTO': [
          ['Item', 'Descripción', 'Cantidad', 'Precio Unit.', 'Precio Total', 'Proveedor', 'Categoría'],
          // Fila vacía para comenzar a editar
          ['', '', '', '', '', '', '']
        ],
        'APU': [
          ['Descripción', 'Tipo', 'Cantidad', 'Unidad', 'Precio Unit.', 'Precio Total', 'Proveedor'],
          // Fila vacía para comenzar a editar
          ['', '', '', '', '', '', '']
        ],
        'RECURSOS': [
          ['Descripción', 'Proveedor', 'Precio', 'Categoría', 'Fecha', 'Origen'],
          // Fila vacía para comenzar a editar
          ['', '', '', '', '', '']
        ]
      };
      
      setExcelData(templates);
      setSheetNames(['PRESUPUESTO', 'APU', 'RECURSOS']);
    } catch (error) {
      console.error('Error inicializando plantillas:', error);
      alert('Error inicializando plantillas');
    } finally {
      setLoading(false);
    }
  };

  const loadExcelTemplate = async () => {
    setLoading(true);
    try {
  const response = await axios.get(`${API_BASE_URL}/api/excel/template?projectId=${selectedProject}`);
      if (response.data.success) {
        setExcelData(response.data.data.sheets);
        setSheetNames(response.data.data.sheetNames);
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
      alert('Error cargando plantillas Excel');
    } finally {
      setLoading(false);
    }
  };

  // Exportar Excel para descarga
  const exportExcel = async () => {
    setSaving(true);
    try {
      const projectName = selectedProject 
        ? proyectos.find(p => p._id === selectedProject)?.nombre || 'proyecto'
        : 'presupuesto';
        
  const response = await axios.post(`${API_BASE_URL}/api/excel/export`, {
        sheets: excelData,
        fileName: projectName.toLowerCase().replace(/\s+/g, '_'),
        projectId: selectedProject
      }, {
        responseType: 'blob'
      });
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Excel exportado exitosamente');
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('❌ Error exportando archivo');
    } finally {
      setSaving(false);
    }
  };

  // Agregar productos del dataset
  const addDatasetToSheet = async (format = 'recursos') => {
    if (productosDatabase.length === 0) {
      alert('No hay productos en el dataset');
      return;
    }

    try {
      const currentSheetName = sheetNames[activeSheet];
  const response = await axios.post(`${API_BASE_URL}/api/excel/add-dataset`, {
        sheetName: currentSheetName,
        products: productosDatabase,
        format: format,
        projectId: selectedProject
      });

      if (response.data.success) {
        // Actualizar datos localmente
        setExcelData({
          ...excelData,
          [currentSheetName]: response.data.data
        });
        alert(`✅ ${response.data.rowsAdded} filas agregadas`);
      }
    } catch (error) {
      console.error('Error agregando dataset:', error);
      alert('❌ Error agregando productos del dataset');
    }
  };

  // Convertir productos del carrito a formato Excel
  const convertCartToExcelFormat = (productos, format) => {
    switch (format) {
      case 'presupuesto':
        return productos.map((item, index) => [
          index + 1, // ITEM
          item.title || '',
          item.unit || 'un', // UNIDAD
          item.quantity || 1, // CANTIDAD
          extractNumericPrice(item.price) || 0, // PRECIO UNITARIO
          (extractNumericPrice(item.price) || 0) * (item.quantity || 1), // PRECIO TOTAL
          item.source || '',
          item.category || 'General',
          selectedProject || '' // PROYECTO
        ]);

      case 'apu':
        return productos.map(item => [
          'NUEVA ACTIVIDAD', // ACTIVIDAD
          item.title || '',
          'MATERIAL', // TIPO por defecto
          item.unit || 'un', // UNIDAD
          item.quantity || 1, // CANTIDAD
          extractNumericPrice(item.price) || 0, // PRECIO UNITARIO
          (extractNumericPrice(item.price) || 0) * (item.quantity || 1), // PRECIO TOTAL
          item.source || ''
        ]);

      case 'recursos':
        return productos.map((item, index) => [
          `MAT${String(index + 1).padStart(3, '0')}`, // CÓDIGO automático
          item.title || '',
          item.unit || 'un', // UNIDAD
          extractNumericPrice(item.price) || 0,
          item.source || '',
          item.category || 'General',
          new Date().toLocaleDateString(),
          'Carrito'
        ]);

      default:
        return productos.map(item => [
          item.title,
          item.price,
          item.source
        ]);
    }
  };

  // Extraer precio numérico
  const extractNumericPrice = (priceString) => {
    if (!priceString) return 0;
    if (typeof priceString === 'number') return priceString;
    
    const cleaned = priceString.toString()
      .replace(/[$.,\s]/g, '')
      .replace(/[^\d]/g, '');
    
    return parseInt(cleaned) || 0;
  };

  // Agregar productos del carrito directamente a la hoja activa
  const addCartToSheet = (format = 'presupuesto') => {
    if (cartItems.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }

    const currentSheetName = sheetNames[activeSheet];
    const currentData = [...excelData[currentSheetName]];
    
    // Convertir productos del carrito al formato apropiado
    const newRows = convertCartToExcelFormat(cartItems, format);
    
    // Agregar al final de los datos existentes
    newRows.forEach(row => {
      currentData.push(row);
    });

    // Actualizar estado local
    setExcelData({
      ...excelData,
      [currentSheetName]: currentData
    });

    alert(`✅ ${cartItems.length} productos del carrito agregados a ${currentSheetName}`);
  };

  // Importar productos del carrito a una hoja específica
  const importCartToSheet = (format) => {
    if (cartItems.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }
    addCartToSheet(format);
  };

  // Importar productos del dataset a una hoja específica  
  const importDatasetToSheet = (format) => {
    if (productosDatabase.length === 0) {
      alert('No hay productos en el dataset');
      return;
    }
    addDatasetToSheet(format);
  };

  // Restaurar backup
  // Restaurar backup (funcionalidad simplificada)
  const restoreBackup = async (backupName) => {
    if (!window.confirm(`¿Restaurar desde ${backupName}? Se perderán los cambios no guardados.`)) {
      return;
    }

    try {
  const response = await axios.post(`${API_BASE_URL}/api/excel/restore/${backupName}`);
      if (response.data.success) {
        alert('✅ Archivo restaurado exitosamente');
        await loadExcelTemplate(); // Cambiar loadExcelData por loadExcelTemplate
      }
    } catch (error) {
      console.error('Error restaurando backup:', error);
      alert('❌ Error restaurando backup');
    }
  };

  // Manejar cambios en la tabla
  const handleTableChange = (changes) => {
    if (changes && excelData) {
      const currentSheetName = sheetNames[activeSheet];
      const newData = [...excelData[currentSheetName]];
      
      changes.forEach(([row, col, oldValue, newValue]) => {
        if (!newData[row]) newData[row] = [];
        newData[row][col] = newValue;
      });
      
      setExcelData({
        ...excelData,
        [currentSheetName]: newData
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando Excel...</p>
        </div>
      </div>
    );
  }

  if (!excelData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Cargando plantillas Excel...</h2>
        <button 
          onClick={initializeLocalTemplates}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Inicializar Plantillas
        </button>
      </div>
    );
  }

  const currentSheetName = sheetNames[activeSheet];
  const currentSheetData = excelData[currentSheetName] || [];
  const sheetConfig = getSheetConfig(currentSheetName);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información del proyecto */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                📊 Plantillas Excel para Proyectos
                {selectedProject && projectExcelData && (
                  <span className="text-lg text-blue-600">
                    - {projectExcelData.project.name}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedProject 
                  ? "Genera presupuestos, APUs y recursos específicos del proyecto seleccionado"
                  : "Selecciona un proyecto para generar plantillas Excel con datos específicos"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Información del proyecto seleccionado */}
              {selectedProject && projectExcelData && (
                <div className="text-right text-sm">
                  <div className="text-gray-600">Cliente: {projectExcelData.project.client}</div>
                  <div className="text-gray-600">Tipo: {projectExcelData.template.name} {projectExcelData.template.icon}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de selección de proyecto */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-blue-800">
                Seleccionar Proyecto:
              </label>
              <select
                value={selectedProject}
                onChange={(e) => handleProjectSelection(e.target.value)}
                className="px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-w-[300px]"
                disabled={loading}
              >
                <option value="">🏗️ Selecciona un proyecto...</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto.id || proyecto._id} value={proyecto.id || proyecto._id}>
                    {availableTemplates.find(t => t.id === proyecto.type)?.icon || '🏗️'} {proyecto.name}
                  </option>
                ))}
              </select>
              
              {loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Cargando...</span>
                </div>
              )}
            </div>

            {/* Información del proyecto y acciones */}
            {selectedProject && projectExcelData && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-blue-700">
                  Presupuesto: <span className="font-semibold">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
                      .format(projectExcelData.project.budget)}
                  </span>
                </div>
                <button
                  onClick={() => handleProjectSelection('')}
                  className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
                >
                  ✕ Limpiar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Panel principal */}
          <div className="flex-1">
              
              <button
                onClick={loadExcelTemplate}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                🔄 Cargar del Servidor
              </button>
              <button
                onClick={() => setShowDatasetPanel(!showDatasetPanel)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                📦 Dataset ({productosDatabase.length})
              </button>
              <button
                onClick={() => setShowCartPanel(!showCartPanel)}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                🛒 Carrito ({cartItems.length})
              </button>
              <button
                onClick={exportExcel}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '� Exportando...' : '� Exportar Excel'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Panel principal */}
          <div className="flex-1">
            {/* Pestañas */}
            <div className="bg-white rounded-t-lg border border-b-0">
              <div className="flex">
                {sheetNames.map((sheetName, index) => (
                  <button
                    key={sheetName}
                    onClick={() => setActiveSheet(index)}
                    className={`px-4 py-3 border-r text-sm font-medium ${
                      index === activeSheet
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {sheetName}
                  </button>
                ))}
              </div>
            </div>

            {/* Barra de herramientas */}
            <div className="bg-gray-50 border-x px-4 py-2 flex items-center gap-4 text-sm">
              <span className="font-medium">Hoja activa: {currentSheetName}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">Filas: {currentSheetData.length}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">Columnas: {currentSheetData[0]?.length || 0}</span>
            </div>

            {/* Tabla Excel */}
            <div className="bg-white border rounded-b-lg overflow-hidden">
              <HotTable
                data={currentSheetData}
                {...sheetConfig}
                height="600"
                stretchH="all"
                width="100%"
                licenseKey="non-commercial-and-evaluation"
                afterChange={handleTableChange}
                contextMenu={true}
                manualColumnResize={true}
                manualRowResize={true}
                rowHeaders={true}
                dropdownMenu={true}
                filters={true}
                className="excel-table"
              />
            </div>
          </div>

          {/* Panel lateral Dataset */}
          {showDatasetPanel && (
            <div className="w-80 bg-white rounded-lg shadow-lg p-4 h-fit">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                📦 Agregar Dataset
                <button
                  onClick={() => setShowDatasetPanel(false)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </h3>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => addDatasetToSheet('recursos')}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                >
                  📋 Agregar como Recursos
                </button>
                <button
                  onClick={() => addDatasetToSheet('presupuesto')}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  💰 Agregar a Presupuesto
                </button>
                <button
                  onClick={() => addDatasetToSheet('apu')}
                  className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700"
                >
                  🔧 Agregar a APU
                </button>
                <button
                  onClick={exportExcel}
                  className="w-full bg-gray-800 text-white py-2 px-3 rounded text-sm hover:bg-gray-900"
                >
                  📥 Exportar Excel Completo
                </button>
              </div>

              <div className="text-xs text-gray-600 mb-4">
                Se agregarán {productosDatabase.length} productos a la hoja "{currentSheetName}"
              </div>

              {/* Información adicional */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">ℹ️ Información</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Los productos se agregan al final de la hoja</p>
                  <p>• Puedes editar los datos después de agregar</p>
                  <p>• Usa "Exportar Excel" para descargar el archivo</p>
                </div>
              </div>
            </div>
          )}

          {/* Panel lateral Carrito */}
          {showCartPanel && (
            <div className="w-80 bg-white rounded-lg shadow-lg p-4 h-fit">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                🛒 Importar desde Carrito
                <button
                  onClick={() => setShowCartPanel(false)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </h3>

              <div className="space-y-3 mb-4">
                <button
                  onClick={() => importCartToSheet('recursos')}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                >
                  📋 Importar como Recursos
                </button>
                <button
                  onClick={() => importCartToSheet('presupuesto')}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  💰 Importar a Presupuesto
                </button>
                <button
                  onClick={() => importCartToSheet('apu')}
                  className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700"
                >
                  🔧 Importar a APU
                </button>
              </div>

              <div className="text-xs text-gray-600 mb-4">
                Se importarán {cartItems.length} productos del carrito a la hoja "{currentSheetName}"
              </div>

              {/* Lista de productos del carrito */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">🛒 Productos en Carrito</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {cartItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="font-medium text-gray-800 truncate">
                        {item.title}
                      </div>
                      <div className="text-gray-600 flex justify-between">
                        <span>Cantidad: {item.quantity}</span>
                        <span className="font-medium">{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información adicional */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-sm mb-2">ℹ️ Información</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Los productos se importan con cantidades del carrito</p>
                  <p>• Puedes editar los datos después de importar</p>
                  <p>• Los precios se mantienen del carrito</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelOnline;
