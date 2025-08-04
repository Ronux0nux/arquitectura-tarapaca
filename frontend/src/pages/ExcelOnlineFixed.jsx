import React, { useState, useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ProjectExcelService from '../services/ProjectExcelService';
import { useNotifications } from '../context/NotificationContext';

const ExcelOnline = () => {
  const [excelData, setExcelData] = useState({
    'Hoja 1': [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', '']
    ]
  });
  const [sheetNames, setSheetNames] = useState(['Hoja 1']);
  const [activeSheet, setActiveSheet] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectExcelData, setProjectExcelData] = useState(null);
  const hotTableRef = useRef(null);
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Cargar proyectos disponibles
  const [availableProjects] = useState([
    { id: 'proj_001', name: 'Edificio Residencial Norte', type: 'construction', budget: 850000000 },
    { id: 'proj_002', name: 'Casa Unifamiliar Premium', type: 'architecture', budget: 320000000 },
    { id: 'proj_003', name: 'Puente Vehicular Tarapacá', type: 'infrastructure', budget: 1200000000 },
    { id: 'proj_004', name: 'Renovación Centro Comercial', type: 'renovation', budget: 450000000 }
  ]);

  useEffect(() => {
    const savedCart = localStorage.getItem('excelCartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('excelCartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleProjectSelection = async (project) => {
    try {
      setSelectedProject(project);
      notifyInfo(`Generando datos para ${project.name}...`);
      
      const projectData = await ProjectExcelService.generateProjectExcelData(project.id);
      setProjectExcelData(projectData);
      
      // Actualizar las hojas con los datos del proyecto
      const newExcelData = {};
      const newSheetNames = [];
      
      if (projectData.budgetSheet) {
        newExcelData['Presupuesto'] = projectData.budgetSheet.data;
        newSheetNames.push('Presupuesto');
      }
      
      if (projectData.apuSheet) {
        newExcelData['APU'] = projectData.apuSheet.data;
        newSheetNames.push('APU');
      }
      
      if (projectData.resourcesSheet) {
        newExcelData['Recursos'] = projectData.resourcesSheet.data;
        newSheetNames.push('Recursos');
      }
      
      setExcelData(newExcelData);
      setSheetNames(newSheetNames);
      setActiveSheet(0);
      
      notifySuccess(`Datos cargados para ${project.name}`);
    } catch (error) {
      notifyError(`Error al cargar proyecto: ${error.message}`);
    }
  };

  const handleCellChange = (changes) => {
    if (changes) {
      const currentSheetName = sheetNames[activeSheet];
      const newData = { ...excelData };
      
      changes.forEach(([row, col, oldValue, newValue]) => {
        if (!newData[currentSheetName][row]) {
          newData[currentSheetName][row] = [];
        }
        newData[currentSheetName][row][col] = newValue;
      });
      
      setExcelData(newData);
    }
  };

  const addNewSheet = () => {
    const newSheetName = `Hoja ${sheetNames.length + 1}`;
    setSheetNames([...sheetNames, newSheetName]);
    setExcelData({
      ...excelData,
      [newSheetName]: [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
      ]
    });
  };

  const addToCart = (cellData) => {
    const newItem = {
      id: Date.now(),
      sheet: sheetNames[activeSheet],
      data: cellData,
      timestamp: new Date().toLocaleString()
    };
    setCartItems([...cartItems, newItem]);
    notifySuccess('Elemento agregado al carrito');
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    notifyInfo('Elemento removido del carrito');
  };

  const exportExcel = async () => {
    setSaving(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      sheetNames.forEach(sheetName => {
        const worksheet = XLSX.utils.aoa_to_sheet(excelData[sheetName] || []);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = selectedProject 
        ? `${selectedProject.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
        : `plantilla_excel_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      saveAs(data, fileName);
      notifySuccess('Excel exportado exitosamente');
    } catch (error) {
      notifyError(`Error al exportar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const currentSheetName = sheetNames[activeSheet];
  const currentSheetData = excelData[currentSheetName] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                📊 Plantillas Excel para Proyectos
                {selectedProject && (
                  <span className="text-lg text-blue-600">
                    - {selectedProject.name}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                Crea y edita plantillas Excel vinculadas a proyectos específicos
              </p>
            </div>
            <div className="flex gap-2">
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
                {saving ? '⏳ Exportando...' : '📥 Exportar Excel'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Panel principal */}
          <div className="flex-1">
            {/* Selector de Proyectos */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
              <h3 className="text-lg font-semibold mb-3">🏗️ Seleccionar Proyecto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {availableProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelection(project)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedProject?.id === project.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{project.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{project.type}</div>
                    <div className="text-xs text-green-600">
                      ${(project.budget / 1000000).toFixed(1)}M
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {sheetName}
                  </button>
                ))}
                <button
                  onClick={addNewSheet}
                  className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  + Nueva Hoja
                </button>
              </div>
            </div>

            {/* Editor Excel */}
            <div className="bg-white rounded-b-lg border">
              <div className="p-4">
                <HotTable
                  ref={hotTableRef}
                  data={currentSheetData}
                  colHeaders={true}
                  rowHeaders={true}
                  contextMenu={true}
                  manualColumnResize={true}
                  manualRowResize={true}
                  afterChange={handleCellChange}
                  stretchH="all"
                  width="100%"
                  height={400}
                  licenseKey="non-commercial-and-evaluation"
                />
              </div>
            </div>
          </div>

          {/* Panel del carrito */}
          {showCartPanel && (
            <div className="w-80 bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🛒 Carrito</h3>
                <button
                  onClick={() => setShowCartPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No hay elementos en el carrito</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{item.sheet}</div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelOnline;
