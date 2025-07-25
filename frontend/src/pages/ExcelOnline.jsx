import React, { useState, useEffect } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import '../components/ExcelOnline.css';
import axios from 'axios';
import { useCotizaciones } from '../context/CotizacionesContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ExcelOnline = () => {
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [showDatasetPanel, setShowDatasetPanel] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [proyectos, setProyectos] = useState([]);
  
  const { productosDatabase } = useCotizaciones();

  // Configuración de Handsontable por tipo de hoja
  const getSheetConfig = (sheetName) => {
    const baseName = sheetName?.toLowerCase() || '';
    
    if (baseName.includes('ppto') || baseName.includes('presupuesto')) {
      return {
        colHeaders: ['Item', 'Descripción', 'Cantidad', 'Precio Unit.', 'Precio Total', 'Proveedor', 'Categoría'],
        columns: [
          { type: 'numeric', width: 60 },
          { type: 'text', width: 300 },
          { type: 'numeric', width: 80 },
          { type: 'numeric', numericFormat: { pattern: '$0,0' }, width: 100 },
          { type: 'numeric', numericFormat: { pattern: '$0,0' }, width: 100 },
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
          { type: 'numeric', width: 80 },
          { type: 'dropdown', source: ['UND', 'M2', 'M3', 'KG', 'TON', 'ML', 'GL'], width: 80 },
          { type: 'numeric', numericFormat: { pattern: '$0,0' }, width: 100 },
          { type: 'numeric', numericFormat: { pattern: '$0,0' }, width: 100 },
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
          { type: 'numeric', numericFormat: { pattern: '$0,0' }, width: 100 },
          { type: 'text', width: 120 },
          { type: 'date', width: 100 },
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

  // Cargar datos del Excel
  useEffect(() => {
    loadExcelTemplate();
    loadProjects();
  }, []);

  const loadExcelTemplate = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/excel/template?projectId=${selectedProject}`);
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

  const loadProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProyectos(response.data);
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  // Exportar Excel para descarga
  const exportExcel = async () => {
    setSaving(true);
    try {
      const projectName = selectedProject 
        ? proyectos.find(p => p._id === selectedProject)?.nombre || 'proyecto'
        : 'presupuesto';
        
      const response = await axios.post(`${API_BASE_URL}/excel/export`, {
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
      const response = await axios.post(`${API_BASE_URL}/excel/add-dataset`, {
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

  // Restaurar backup
  const restoreBackup = async (backupName) => {
    if (!window.confirm(`¿Restaurar desde ${backupName}? Se perderán los cambios no guardados.`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/excel/restore/${backupName}`);
      if (response.data.success) {
        alert('✅ Archivo restaurado exitosamente');
        await loadExcelData();
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
        <h2 className="text-xl font-semibold mb-4">No se pudo cargar el archivo Excel</h2>
        <button 
          onClick={loadExcelData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const currentSheetName = sheetNames[activeSheet];
  const currentSheetData = excelData[currentSheetName] || [];
  const sheetConfig = getSheetConfig(currentSheetName);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📊 Plantillas Excel</h1>
              <p className="text-sm text-gray-600">
                Genera presupuestos, APUs y listados de recursos desde tu dataset
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Selector de proyecto */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin proyecto específico</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto._id} value={proyecto._id}>
                    {proyecto.nombre}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowDatasetPanel(!showDatasetPanel)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                📦 Dataset ({productosDatabase.length})
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

              {/* Lista de backups */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">📂 Backups</h4>
                <div className="max-h-32 overflow-y-auto">
                  {backups.slice(0, 5).map((backup) => (
                    <div key={backup.name} className="flex items-center justify-between py-1 text-xs">
                      <span className="truncate">{new Date(backup.date).toLocaleDateString()}</span>
                      <button
                        onClick={() => restoreBackup(backup.name)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))}
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
