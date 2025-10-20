import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useCotizaciones } from '../context/CotizacionesContext';
import CompraModal from './CompraModal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';

const CotizacionCartV2 = () => {
  const { cartItems, isCartOpen, toggleCart, removeFromCart, updateCartItem, clearCart } = useCart();
  const { guardarCotizacion } = useCotizaciones();
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(''); // 🆕 ID del proyecto seleccionado
  const [projects, setProjects] = useState([]); // 🆕 Lista de proyectos
  const [exportLoading, setExportLoading] = useState(false);
  const [showCompraModal, setShowCompraModal] = useState(false);

  // 🆕 Cargar proyectos al montar el componente
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('📥 Cargando proyectos...');
        const response = await axios.get('http://localhost:5000/api/projects');
        console.log('📦 Respuesta del servidor:', response.data);
        console.log('📊 Tipo de response.data:', typeof response.data);
        console.log('📊 Es array?:', Array.isArray(response.data));
        
        setProjects(response.data || []);
        console.log('✅ Proyectos cargados:', response.data?.length || 0);
      } catch (error) {
        console.error('❌ Error al cargar proyectos:', error);
      }
    };
    
    fetchProjects();
  }, []);

  // 🆕 Actualizar nombre y cliente cuando se selecciona un proyecto
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    const selected = projects.find(p => p.id === parseInt(projectId));
    if (selected) {
      setProjectName(selected.nombre || '');
      setClientName(selected.cliente || ''); // Asumiendo que el proyecto tiene un campo 'cliente'
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    updateCartItem(itemId, { quantity: parseInt(quantity) || 1 });
  };

  const handleUnitChange = (itemId, unit) => {
    updateCartItem(itemId, { unit });
  };

  const handleNotesChange = (itemId, notes) => {
    updateCartItem(itemId, { notes });
  };

  const handleCategoryChange = (itemId, category) => {
    updateCartItem(itemId, { category });
  };

  const exportToExcel = async () => {
    if (cartItems.length === 0) {
      alert('No hay productos en el carrito para exportar');
      return;
    }

    setExportLoading(true);

    try {
      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      
      // HOJA 1: PPTO (Presupuesto) - Estructura exacta del Excel original
      const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const pptoData = [
        ['', '', '', '', '', '', '', '', '', '', '', ''],
        ['Ítem', 'Partida', 'Unidad', 'Cantidad Estimada', 'P.U', 'Total', 'Observaciones', '', '', '', '', ''],
        // Capítulo 1 - Materiales del carrito
        [1, 'Materiales de Construcción', '', '', '', '', '', 'Capítulo 1 – Materiales Seleccionados', '', '', '', ''],
        ...cartItems.map((item, index) => {
          const cantidad = item.quantity || 1;
          const precioText = item.price || 'Consultar';
          const precio = typeof precioText === 'string' && precioText.includes('$') 
            ? parseFloat(precioText.replace(/[$.,\s]/g, '')) || 0
            : 0;
          const total = precio > 0 ? precio * cantidad : 'Consultar';
          
          return [
            `1.${index + 1}`,
            item.title,
            item.unit || 'un',
            cantidad,
            precio > 0 ? precio : precioText,
            total,
            item.notes || '',
            `1.${index + 1} ${item.title}`,
            '', '', '', ''
          ];
        }),
        [''],
        ['', `TOTAL ITEMS: ${totalItems}`, '', '', '', '', `Proyecto: ${projectName || 'Sin especificar'}`, '', '', '', '', ''],
        ['', '', '', '', '', '', `Cliente: ${clientName || 'Sin especificar'}`, '', '', '', '', ''],
        ['', '', '', '', '', '', `Fecha: ${new Date().toLocaleDateString('es-CL')}`, '', '', '', '', '']
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(pptoData);
      XLSX.utils.book_append_sheet(wb, ws1, 'PPTO');
      
      // HOJA 2: APU (Análisis de Precios Unitarios) - Estructura exacta del Excel original
      const apuData = [
        ['ANÁLISIS DE PRECIOS UNITARIOS (APU)', '', '', '', '', '', ''],
        ['']
      ];
      
      cartItems.forEach((item, index) => {
        const precio = typeof item.price === 'string' && item.price.includes('$') 
          ? parseFloat(item.price.replace(/[$.,\s]/g, '')) || 0
          : 0;
        const cantidad = item.quantity || 1;
        const subtotalMaterial = precio * cantidad;
        const manoObra = subtotalMaterial * 0.1; // 10% mano de obra
        const leyesSociales = manoObra * 0.41; // 41% leyes sociales
        const herramientas = subtotalMaterial * 0.02; // 2% herramientas
        const total = subtotalMaterial + manoObra + leyesSociales + herramientas;
        
        apuData.push(
          [`Ítem 1.${index + 1} – ${item.title}`, '', '', '', '', '', item.title],
          [`Unidad: ${item.unit || 'un'}`, '', '', '', '', '', ''],
          ['Tipo', 'Recurso', 'Unidad', 'Cantidad', 'P.U (CLP)', 'Subtotal (CLP)', ''],
          ['Material', item.title, item.unit || 'un', cantidad, precio, subtotalMaterial, ''],
          ['Mano de Obra', 'Instalación/Montaje', 'día', (cantidad * 0.1).toFixed(3), 50000, manoObra, ''],
          ['Mano de Obra', 'Leyes Sociales', '%', 0.41, manoObra, leyesSociales, ''],
          ['Equipo/Herramienta', 'Herramientas menores', 'global', (cantidad * 0.02).toFixed(3), 10000, herramientas, ''],
          ['', '', '', '', '', total.toFixed(2), ''],
          ['']
        );
      });
      
      const ws2 = XLSX.utils.aoa_to_sheet(apuData);
      XLSX.utils.book_append_sheet(wb, ws2, 'APU');
      
      // HOJA 3: RECURSOS - Base de datos exacta del Excel original
      const recursosData = [
        ['TIPO', 'RECURSO', 'VALOR', 'UNIDAD'],
        // Mano de obra estándar (igual al Excel original)
        ['Mano de obra', 'Jornal', 45000, 'día'],
        ['Mano de obra', 'Ayudante', 45000, 'día'],
        ['Mano de obra', 'Maestro', 50000, 'día'],
        ['Mano de obra', 'Carpintero', 50000, 'día'],
        ['Mano de obra', 'Pintor', 50000, 'día'],
        ['Mano de obra', 'Enfierrador', 50000, 'día'],
        ['Mano de obra', 'Ayudante cerrajero', 45000, 'día'],
        ['Mano de obra', 'Ceramista', 55000, 'día'],
        ['Mano de obra', 'Albañil', 55000, 'día'],
        ['Mano de obra', 'Cerrajero montajista', 55000, 'día'],
        ['Mano de obra', 'Maestro techumbre', 55000, 'día'],
        ['Mano de obra', 'Eléctrico', 55000, 'día'],
        ['Mano de obra', 'Sanitario', 55000, 'día'],
        ['Mano de obra', 'Instalador vinílico', 60000, 'día'],
        ['Mano de obra', 'Instalador piso caucho', 60000, 'día'],
        ['Mano de obra', 'Capataz', 65000, 'día'],
        ['Mano de obra', 'Leyes Sociales', 0.41, '%'],
        // Materiales estándar (igual al Excel original)
        ['Material', 'Planchas OSB 11mm', 7500, 'm²'],
        ['Material', 'Pie derecho pino 2"x2"', 1800, 'm'],
        ['Material', 'Perfil metálico 40x40 mm', 6000, 'm'],
        ['Material', 'Plancha OSB 18 mm', 12000, 'm²'],
        ['Material', 'Vinilo autoadhesivo impresión', 7000, 'm²'],
        ['Material', 'Cables y protecciones eléctricas', 80000, 'global'],
        ['Material', 'Tuberías PVC + fittings provisionales', 60000, 'global'],
        ['Material', 'Letreros PVC seguridad', 5000, 'unidad'],
        ['Material', 'Extintores tipo 10 lb recargables', 25000, 'unidad'],
        ['Material', 'EPP y señalética interna completa', 20000, 'set'],
        ['Material', 'Cal y estacas para trazado', 40000, 'global'],
        ['Material', 'Tornillos y fijaciones', 20000, 'global'],
        // Equipos y herramientas (igual al Excel original)
        ['Equipo/Herramienta', 'Herramientas instalación menor', 10000, 'global'],
        ['Equipo/Herramienta', 'Arriendo container oficina', 350000, 'mes'],
        ['Equipo/Herramienta', 'Arriendo container baño químico', 120000, 'mes'],
        ['Equipo/Herramienta', 'Transporte de módulos', 80000, 'viaje'],
        ['Equipo/Herramienta', 'Trámite y conexión a servicios básicos', 150000, 'global'],
        ['Equipo/Herramienta', 'Herramientas menores (pala, picota)', 30000, 'global'],
        ['Equipo/Herramienta', 'Carretilla y baldes', 15000, 'global'],
        ['Equipo/Herramienta', 'Herramientas de fijación y soporte', 10000, 'global'],
        // Recursos adicionales del carrito
        ...cartItems.map(item => [
          'Material',
          item.title,
          typeof item.price === 'string' && item.price.includes('$') 
            ? parseFloat(item.price.replace(/[$.,\s]/g, '')) || 0
            : 0,
          item.unit || 'un'
        ])
      ];
      
      const ws3 = XLSX.utils.aoa_to_sheet(recursosData);
      XLSX.utils.book_append_sheet(wb, ws3, 'RECURSOS');

      // Guardar archivo con formato similar al original
      const fileName = `Cotizacion_${(projectName || 'Proyecto').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('es-CL').replace(/\//g, '-')}.xlsx`;
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);

      // Guardar en historial de cotizaciones
      const cotizacionData = {
        projectId: selectedProjectId ? parseInt(selectedProjectId) : null, // 🆕 ID del proyecto
        projectName: projectName || 'Proyecto sin nombre',
        clientName: clientName || 'Cliente no especificado',
        productos: cartItems,
        fileName: fileName
      };
      
      guardarCotizacion(cotizacionData);
      
      // Mostrar notificación de éxito
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Cotización exportada y guardada en historial`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);

    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar el archivo. Intenta nuevamente.');
    } finally {
      setExportLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Información copiada al portapapeles');
    });
  };

  const handleCompra = async (compraData) => {
    try {
      // Aquí puedes agregar lógica para guardar la compra en el backend
      console.log('Compra realizada:', compraData);
      
      // Limpiar carrito después de la compra
      clearCart();
      
      // Mostrar notificación de éxito
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = `✅ Compra procesada y asociada al proyecto`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
      
    } catch (error) {
      console.error('Error procesando compra:', error);
      throw error;
    }
  };

  const getTotalEstimated = () => {
    return cartItems.reduce((total, item) => {
      const precio = typeof item.price === 'string' && item.price.includes('$') 
        ? parseFloat(item.price.replace(/[$.,\s]/g, '')) || 0
        : 0;
      return total + (precio * (item.quantity || 1));
    }, 0);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">📊 Cotizador Profesional ({cartItems.length} productos)</h2>
          <button
            onClick={toggleCart}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
              <p className="text-gray-400 mt-2">Agrega productos desde el buscador</p>
            </div>
          ) : (
            <>
              {/* Información del proyecto */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-4">📋 Información del Proyecto</h3>
                
                {/* 🆕 Selector de Proyecto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Proyecto Existente
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Seleccionar un proyecto --</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.nombre} {project.codigo ? `(${project.codigo})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">💰 Resumen Financiero</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-xl font-bold">{cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Productos</p>
                    <p className="text-xl font-bold">{cartItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Estimado</p>
                    <p className="text-xl font-bold text-green-600">
                      ${getTotalEstimated().toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="text-xl font-bold text-blue-600">Borrador</p>
                  </div>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Información del producto */}
                      <div className="lg:col-span-4">
                        <div className="flex items-start gap-3">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            1.{index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{item.source}</p>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              {item.price || 'Consultar'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="lg:col-span-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Unidad</label>
                            <select
                              value={item.unit || 'un'}
                              onChange={(e) => handleUnitChange(item.id, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="un">un</option>
                              <option value="m">m</option>
                              <option value="m²">m²</option>
                              <option value="m³">m³</option>
                              <option value="kg">kg</option>
                              <option value="saco">saco</option>
                              <option value="gl">gl</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                            <select
                              value={item.category || 'General'}
                              onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="General">General</option>
                              <option value="Albañilería">Albañilería</option>
                              <option value="Estructura">Estructura</option>
                              <option value="Terminaciones">Terminaciones</option>
                              <option value="Instalaciones">Instalaciones</option>
                              <option value="Herramientas">Herramientas</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Total</label>
                            <div className="text-sm font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                              {typeof item.price === 'string' && item.price.includes('$') 
                                ? `$${(parseFloat(item.price.replace(/[$.,\s]/g, '')) * (item.quantity || 1)).toLocaleString('es-CL')}`
                                : 'Consultar'
                              }
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs text-gray-500 mb-1">Observaciones</label>
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                            placeholder="Notas adicionales..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="lg:col-span-2">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => copyToClipboard(`${item.title} - ${item.price} - ${item.source}`)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                          >
                            📋 Copiar
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>📊 Formato compatible con Excel profesional</p>
              <p>🏗️ Incluye PPTO, APU y RECURSOS como tu archivo original</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCompraModal(true)}
                disabled={cartItems.length === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                🛒 Comprar ({cartItems.length})
              </button>
              <button
                onClick={exportToExcel}
                disabled={exportLoading || cartItems.length === 0}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exportando...
                  </>
                ) : (
                  <>
                    📊 Exportar Excel
                  </>
                )}
              </button>
              <button
                onClick={toggleCart}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Compra */}
      <CompraModal
        isOpen={showCompraModal}
        onClose={() => setShowCompraModal(false)}
        productos={cartItems}
        onComprar={handleCompra}
      />
    </div>
  );
};

export default CotizacionCartV2;
