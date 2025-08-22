import React, { useState, useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ApiService from '../services/ApiService';
import CotizacionService from '../services/CotizacionService';
import { useNotifications } from '../context/NotificationContext';

const ExcelOnline = () => {
  const [excelData, setExcelData] = useState({
    'Presupuesto': [
      ['Item', 'Descripción', 'Cantidad', 'Precio Unit.', 'Precio Total', 'Proveedor', 'Categoría'],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '']
    ]
  });
  const [sheetNames, setSheetNames] = useState(['Presupuesto']);
  const [activeSheet, setActiveSheet] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectPurchases, setProjectPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const hotTableRef = useRef(null);
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();

  // Cargar proyectos reales desde la base de datos
  const [availableProjects, setAvailableProjects] = useState([]);

  useEffect(() => {
    loadRealProjects();
    const savedCart = localStorage.getItem('excelCartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('excelCartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Cargar proyectos reales desde la base de datos
  const loadRealProjects = async () => {
    try {
      setLoading(true);
      console.log('📊 Cargando proyectos reales...');
      
      const response = await ApiService.get('/projects');
      
      if (response.success && response.data) {
        setAvailableProjects(response.data);
        // Proyectos cargados sin notificación automática
      } else {
        // Fallback: cargar proyectos de ejemplo si no hay conexión
        const fallbackProjects = [
          { 
            id: 'proyecto_ejemplo_1', 
            name: 'Proyecto Ejemplo 1', 
            description: 'Proyecto de ejemplo para demostración',
            budget: 500000000,
            status: 'active',
            type: 'construction'
          }
        ];
        setAvailableProjects(fallbackProjects);
        // Usando proyectos de ejemplo sin notificación automática
      }
    } catch (error) {
      console.error('❌ Error cargando proyectos:', error);
      
      // Fallback a proyectos de ejemplo
      const fallbackProjects = [
        { 
          id: 'proyecto_ejemplo_1', 
          name: 'Proyecto Ejemplo 1', 
          description: 'Proyecto de ejemplo para demostración',
          budget: 500000000,
          status: 'active',
          type: 'construction'
        },
        { 
          id: 'proyecto_ejemplo_2', 
          name: 'Proyecto Ejemplo 2', 
          description: 'Segundo proyecto de ejemplo',
          budget: 300000000,
          status: 'active',
          type: 'architecture'
        }
      ];
      
      setAvailableProjects(fallbackProjects);
      notifyError('Error de conexión. Usando proyectos de ejemplo');
    } finally {
      setLoading(false);
    }
  };

  // Cargar compras/cotizaciones reales para un proyecto específico
  const loadProjectPurchases = async (projectId) => {
    try {
      setLoading(true);
      console.log(`📋 Cargando compras para proyecto: ${projectId}`);
      
      // Intentar cargar cotizaciones del proyecto desde la base de datos
      const cotizacionesResponse = await CotizacionService.getCotizacionesByProject(projectId);
      
      let purchases = [];
      
      if (cotizacionesResponse.success && cotizacionesResponse.cotizaciones) {
        // Procesar cotizaciones reales del proyecto
        purchases = cotizacionesResponse.cotizaciones.flatMap(cotizacion => 
          cotizacion.productos?.map(producto => ({
            item: producto.codigo || 'N/A',
            descripcion: producto.nombre || producto.descripcion || 'Sin descripción',
            cantidad: producto.cantidad || 1,
            precioUnitario: producto.precio || 0,
            precioTotal: (producto.cantidad || 1) * (producto.precio || 0),
            proveedor: cotizacion.proveedor?.nombre || 'Sin proveedor',
            categoria: producto.categoria || 'Sin categoría',
            fechaCotizacion: cotizacion.fecha || new Date().toISOString().split('T')[0]
          })) || []
        );
      }
      
      // Si no hay compras reales, crear datos de ejemplo para el proyecto
      if (purchases.length === 0) {
        purchases = [
          {
            item: 'ITEM-001',
            descripcion: 'Cemento Portland Tipo I - 42.5kg',
            cantidad: 100,
            precioUnitario: 8500,
            precioTotal: 850000,
            proveedor: 'Cementos Tarapacá',
            categoria: 'Materiales Básicos'
          },
          {
            item: 'ITEM-002', 
            descripcion: 'Fierro Corrugado 12mm x 12m',
            cantidad: 50,
            precioUnitario: 15000,
            precioTotal: 750000,
            proveedor: 'Aceros del Norte',
            categoria: 'Estructural'
          },
          {
            item: 'ITEM-003',
            descripcion: 'Ladrillos Artesanales 24x11x7cm',
            cantidad: 2000,
            precioUnitario: 320,
            precioTotal: 640000,
            proveedor: 'Ladrillería San Pedro',
            categoria: 'Albañilería'
          }
        ];
        
        notifyInfo(`No se encontraron compras para este proyecto. Mostrando ${purchases.length} items de ejemplo.`);
      } else {
        // Compras cargadas sin notificación automática
      }
      
      setProjectPurchases(purchases);
      return purchases;
      
    } catch (error) {
      console.error('❌ Error cargando compras del proyecto:', error);
      
      // Fallback a datos de ejemplo
      const fallbackPurchases = [
        {
          item: 'ITEM-ERROR',
          descripcion: 'Error al cargar - Dato de ejemplo',
          cantidad: 1,
          precioUnitario: 0,
          precioTotal: 0,
          proveedor: 'Error de conexión',
          categoria: 'Sin categoría'
        }
      ];
      
      setProjectPurchases(fallbackPurchases);
      notifyError('Error cargando compras. Mostrando datos de ejemplo.');
      return fallbackPurchases;
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelection = async (project) => {
    try {
      setSelectedProject(project);
      notifyInfo(`Generando datos para ${project.name}...`);
      
      // Cargar compras reales del proyecto
      const purchases = await loadProjectPurchases(project.id);
      
      // Crear hoja de presupuesto con datos reales
      const budgetData = [
        ['Item', 'Descripción', 'Cantidad', 'Precio Unit.', 'Precio Total', 'Proveedor', 'Categoría'],
        ...purchases.map(purchase => [
          purchase.item,
          purchase.descripcion,
          purchase.cantidad,
          `$${purchase.precioUnitario.toLocaleString()}`,
          `$${purchase.precioTotal.toLocaleString()}`,
          purchase.proveedor,
          purchase.categoria
        ]),
        [], // Fila vacía
        ['TOTAL PRESUPUESTO', '', '', '', `$${purchases.reduce((total, p) => total + p.precioTotal, 0).toLocaleString()}`, '', '']
      ];
      
      // Crear hoja de resumen por categoría
      const categorySummary = {};
      purchases.forEach(purchase => {
        const cat = purchase.categoria || 'Sin categoría';
        if (!categorySummary[cat]) {
          categorySummary[cat] = { items: 0, total: 0 };
        }
        categorySummary[cat].items += 1;
        categorySummary[cat].total += purchase.precioTotal;
      });
      
      const summaryData = [
        ['Categoría', 'Cantidad Items', 'Total'],
        ...Object.entries(categorySummary).map(([cat, data]) => [
          cat,
          data.items,
          `$${data.total.toLocaleString()}`
        ])
      ];
      
      // Actualizar las hojas
      const newExcelData = {
        'Presupuesto': budgetData,
        'Resumen por Categoría': summaryData,
        'Items por Proveedor': [
          ['Proveedor', 'Item', 'Descripción', 'Total'],
          ...purchases.map(p => [p.proveedor, p.item, p.descripcion, `$${p.precioTotal.toLocaleString()}`])
        ]
      };
      
      const newSheetNames = ['Presupuesto', 'Resumen por Categoría', 'Items por Proveedor'];
      
      setExcelData(newExcelData);
      setSheetNames(newSheetNames);
      setActiveSheet(0);
      
      notifySuccess(`Presupuesto generado para ${project.name} con ${purchases.length} items`);
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

  // Plantillas predefinidas (solo para fallback)
  const defaultTemplates = [
    {
      name: 'Opción 1: Cierre Sólido Mixto de Alta Seguridad',
      description: [
        'Altura total: 3,00 m (1,00 m muro + 2,00 m reja metálica)',
        'Unidad: metro lineal (ml)',
        'Cantidad estimada: 910'
      ],
      table: [
        ['Tipo', 'Recurso', 'Unidad', 'Cantidad', 'P.U (CLP)', 'Subtotal (CLP)'],
        ['Material', 'Bloque de hormigón vibrado tipo G 39x19x14 cm', 'un', 15, 1050, 15750],
        ['Material', 'Mortero cemento-arena 1:4', 'kg', 12, 180, 2160],
        ['Material', 'Reja metálica galvanizada 2,00 m altura', 'ml', 1, 42000, 42000],
        ['Material', 'Pilar metálico cuadrado 60x60x2 mm', 'ml', 1.8, 5800, 10440],
        ['Material', 'Hormigón G-25 para fundación (considerando zanja 20x40 cm)', 'm³', 0.08, 133700, 10696],
        ['Material', 'Acero A63-42H Ø10 mm (para fundación)', 'kg', 5, 1250, 6250],
        ['Material', 'Aditivos impermeabilizantes', 'lt', 0.3, 3500, 1050],
        ['Equipo/Herr.', 'Herramientas menores y encofrado manual', 'global', 1, 2000, 2000],
        ['Mano de Obra', 'Maestro albañil', 'día', 0.1, 55000, 5500],
        ['Mano de Obra', 'Ayudante albañil', 'día', 0.15, 45000, 6750],
        ['Mano de Obra', 'Instalador metálico', 'día', 0.08, 55000, 4400],
        ['Leyes Sociales', 'Leyes Sociales', '%', 0.41, 16650, 6827],
      ],
      totals: [
        ['Total parcial', '', '', '', '', 113823],
        ['Total general', '', '', '', '', 103578475]
      ],
      cotizaciones: [
        ['Recurso', 'Cotización real', 'Fuente / Observación'],
        ['Bloque de hormigón vibrado tipo G 14×19×39 cm', '1.590/un', 'Sodimac – Bloque liso gris'],
        ['Mortero cemento-arena 1:4 (saco 25 kg)', '2.880', 'Sodimac – Hormigón preparado TOPEX 25 kg'],
        ['Reja metálica galvanizada 2,00 m', '42.000/ml', 'CYM Chile – Panel malla electrosoldada galvanizada'],
        ['Pilar metálico cuadrado 60×60×2 mm', '5.800/ml', 'Fierronet – Perfil cuadrado 60×60×2 mm x 6 m'],
        ['Hormigón G-25 (fundaciones muro y pilares)', '133.700/m³', 'Manual ONDAC 2024 – Hormigón fundaciones pequeñas'],
        ['Acero A63-42H Ø10 mm', '1.249/kg', 'ONDAC Manual julio 2025 – Acero para armaduras A63-42H Ø10 mm'],
        ['Aditivo impermeabilizante Sika 1', '3.500/lt', 'Sodimac – Aditivo Sika 1 L'],
      ],
      notas: [
        'Se considera fundación corrida para muro y pilares metálicos embebidos.',
        'Reja metálica tipo panel modular galvanizado con fijación mecánica superior.',
        'Espaciamiento entre pilares: 2,50 m',
        'Altura total desde fundación hasta extremo superior: 3,00 m'
      ]
    },
    {
      name: 'Opción 2: Cierre Económico Reforzado',
      description: [
        'Altura total: 3,00 m',
        'Unidad: metro lineal (ml)',
        'Cantidad estimada: 910'
      ],
      table: [
        ['Tipo', 'Recurso', 'Unidad', 'Cantidad', 'P.U (CLP)', 'Subtotal (CLP)'],
        ['Material', 'Malla Acma galvanizada 2,40 m alto, paso 100×50 mm', 'ml', 1, 29500, 29500],
        ['Material', 'Postes metálicos 60x60x2 mm (cada 2,5 m)', 'ml', 0.4, 5800, 2320],
        ['Material', 'Hormigón simple para fundación de postes', 'm³', 0.025, 133700, 3343],
        ['Material', 'Zócalo hormigón ciclópeo (20x20 cm)', 'm³', 0.04, 102000, 4080],
        ['Material', 'Acero Ø10 mm para estribos y refuerzo zócalo', 'kg', 2, 1250, 2500],
        ['Equipo/Herr.', 'Herramientas menores y cortes', 'global', 1, 1500, 1500],
        ['Mano de Obra', 'Cuadrilla mixta (1 oficial + 1 ayudante)', 'día', 0.15, 90000, 13500],
        ['Leyes Sociales', 'Leyes Sociales', '%', 0.41, 13500, 5535],
      ],
      totals: [
        ['Total parcial', '', '', '', '', 62278],
        ['Total general', '', '', '', '', 56672525]
      ],
      cotizaciones: [
        ['Recurso', 'Cotización real', 'Fuente / Observación'],
        ['Malla Acma galvanizada 2,4 m (electrosoldada)', '29.500/ml', 'CYM Chile – Malla Acma electrosoldada 2,4 m altura'],
        ['Poste metálico galvanizado 60x60x2 mm', '5.800/ml', 'Fierronet – Perfil cuadrado 60x60x2 mm x 6 m'],
        ['Hormigón simple para fundación puntual', '133.700/m³', 'Manual ONDAC 2024 – Hormigón fundaciones pequeñas'],
        ['Zócalo de hormigón ciclópeo', '102.000/m³', 'CYM Chile – Precio referencia hormigón ciclópeo m³'],
        ['Acero A63-42H Ø10 mm', '1.249/kg', 'ONDAC Manual julio 2025 – Acero para armaduras A63-42H Ø10 mm'],
      ],
      notas: [
        'Postes metálicos galvanizados 60x60x2 mm, cada 2,5 m',
        'Malla Acma galvanizada electrosoldada 2,4 m alto',
        'Zócalo de hormigón ciclópeo de 0,30 m altura (seguridad y estabilidad)',
        'Fundación de hormigón simple por poste',
        'Portón metálico de 6 m + acceso peatonal universal'
      ]
    },
    // Puedes agregar más plantillas aquí
  ];

  const [templates, setTemplates] = useState([]);

  // Cargar plantillas desde el backend al iniciar
  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        } else {
          setTemplates(defaultTemplates);
        }
      })
      .catch(() => setTemplates(defaultTemplates));
  }, []);

  // Modal de selección de plantilla
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Estado para subir nuevo formato
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFormat, setUploadedFormat] = useState(null);

  // Procesar archivo subido y mostrar vista previa
  const [previewData, setPreviewData] = useState(null);

  // Abrir modal de selección de plantilla
  const handleAddSheet = () => {
    setShowTemplateModal(true);
  };

  // Abrir modal de subida
  const handleShowUploadModal = () => {
    setShowUploadModal(true);
  };

  // Crear hoja nueva con plantilla seleccionada
  const handleSelectTemplate = (templateIdx) => {
    const template = templates[templateIdx];
    const newSheetName = template.name;
    // Estructura: descripción, tabla principal, totales, cotizaciones y notas
    const sheetData = [
      ...template.description.map((desc) => [desc]),
      [],
      ...template.table,
      [],
      ...template.totals,
      [],
      ['Cotizaciones'],
      ...template.cotizaciones,
      [],
      ...template.notas.map((nota, i) => i === 0 ? [nota] : [nota]),
    ];
    setSheetNames([...sheetNames, newSheetName]);
    setExcelData({
      ...excelData,
      [newSheetName]: sheetData
    });
    setActiveSheet(sheetNames.length); // Selecciona la nueva hoja
    setShowTemplateModal(false);
    setSelectedTemplate(null);
    notifySuccess(`Hoja "${newSheetName}" agregada con formato de plantilla.`);
  };

  // Procesar archivo subido (solo estructura base, falta lógica de parseo)
  const handleFormatUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFormat(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target.result;
        let workbook;
        if (file.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'binary', codepage: 65001 });
        } else {
          workbook = XLSX.read(data, { type: 'binary' });
        }
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setPreviewData(jsonData);
      };
      reader.readAsBinaryString(file);
    }
  };

  // Guardar como plantilla (integración backend)
  const handleSaveTemplate = async () => {
    if (previewData && uploadedFormat) {
      const newTemplate = {
        name: uploadedFormat.name,
        description: ['Formato subido por el usuario'],
        table: previewData,
        totals: [],
        cotizaciones: [],
        notas: []
      };
      try {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newTemplate)
        });
        if (response.ok) {
          setTemplates(prev => [...prev, newTemplate]);
          notifySuccess('Formato guardado en el sistema.');
          setShowUploadModal(false);
          setPreviewData(null);
          setUploadedFormat(null);
        } else {
          notifyError('Error al guardar la plantilla en el backend.');
        }
      } catch (err) {
        notifyError('Error de conexión al guardar plantilla.');
      }
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
                📊 Plantillas de Recursos
                {selectedProject && (
                  <span className="text-lg text-blue-600">
                    - {selectedProject.name}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedProject 
                  ? `Presupuesto detallado con compras y cotizaciones del proyecto` 
                  : 'Selecciona un proyecto para ver su presupuesto con compras reales'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShowUploadModal}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                + Subir nuevo formato
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

      {/* Modal para subir formato */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 50 }}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Subir nuevo formato de tabla</h2>
            <input type="file" accept=".xlsx,.csv" onChange={handleFormatUpload} className="mb-4" />
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => { setShowUploadModal(false); setPreviewData(null); setUploadedFormat(null); }}
            >
              ✕
            </button>
            {uploadedFormat && (
              <div className="text-green-600 mt-2">Archivo listo para procesar: {uploadedFormat.name}</div>
            )
            }
            {previewData && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Vista previa:</h3>
                <div className="overflow-auto max-h-64 border rounded">
                  <table className="min-w-full text-xs">
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="border px-2 py-1">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
                  onClick={handleSaveTemplate}
                >
                  Guardar como plantilla
                </button>
              </div>
            )}
            {!previewData && (
              <p className="text-xs text-gray-500 mt-4">Selecciona un archivo Excel o CSV para ver la vista previa y guardar como plantilla.</p>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Panel principal */}
          <div className="flex-1">
            {/* Selector de Proyectos */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
              <h3 className="text-lg font-semibold mb-3">🏗️ Seleccionar Proyecto Real</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Cargando proyectos...</div>
                </div>
              ) : availableProjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">No hay proyectos disponibles</div>
                  <button
                    onClick={loadRealProjects}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Recargar proyectos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelection(project)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedProject?.id === project.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-gray-500 mb-2">{project.description}</div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-green-600">
                          {project.budget ? `$${(project.budget / 1000000).toFixed(1)}M` : 'Sin presupuesto'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status || 'activo'}
                        </div>
                      </div>
                      {project.type && (
                        <div className="text-xs text-gray-500 mt-1 capitalize">{project.type}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {selectedProject && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">
                    Proyecto seleccionado: {selectedProject.name}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {projectPurchases.length} items en el presupuesto | 
                    Total: ${projectPurchases.reduce((total, p) => total + p.precioTotal, 0).toLocaleString()}
                  </div>
                </div>
              )}
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
                    onClick={handleAddSheet}
                    className="px-4 py-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
                    style={{ zIndex: 10 }}
                  >
                    + Agregar hoja
                  </button>
              </div>
            </div>

              {/* Modal de selección de plantilla */}
              {showTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center" style={{ zIndex: 50 }}>
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
                    <h2 className="text-xl font-bold mb-4">Selecciona una plantilla</h2>
                    <ul>
                      {templates.map((tpl, idx) => (
                        <li key={tpl.name} className="mb-4 border-b pb-2">
                          <div className="font-semibold">{tpl.name}</div>
                          <div className="text-sm text-gray-700 whitespace-pre-line mb-2">{tpl.description}</div>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded"
                            onClick={() => handleSelectTemplate(idx)}
                          >
                            Usar esta plantilla
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                      onClick={() => setShowTemplateModal(false)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

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
                  colWidths={[100, 200, 80, 120, 120, 150, 120]}
                  minCols={7}
                  minRows={20}
                  className="excel-table"
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
