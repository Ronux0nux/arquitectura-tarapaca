import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const CotizacionCart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateCartItem, 
    clearCart, 
    isCartOpen, 
    toggleCart 
  } = useCart();
  
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItem(itemId, { quantity: parseInt(newQuantity) });
    }
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
      // Crear datos para Excel
      const excelData = cartItems.map((item, index) => ({
        'N°': index + 1,
        'Producto': item.title,
        'Precio Unitario': item.price,
        'Cantidad': item.quantity,
        'Precio Total': item.price !== 'Precio no disponible' 
          ? `${parseFloat(item.price.replace(/[^\d.,]/g, '').replace(',', '.')) * item.quantity}`
          : 'Calcular manualmente',
        'Categoría': item.category,
        'Proveedor': item.source,
        'Notas': item.notes,
        'Enlace': item.link,
        'Fecha Agregado': new Date(item.dateAdded).toLocaleDateString(),
        'Término de Búsqueda': item.searchTerm
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      
      // Hoja principal con productos
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 5 },  // N°
        { wch: 40 }, // Producto
        { wch: 15 }, // Precio Unitario
        { wch: 10 }, // Cantidad
        { wch: 15 }, // Precio Total
        { wch: 15 }, // Categoría
        { wch: 20 }, // Proveedor
        { wch: 30 }, // Notas
        { wch: 50 }, // Enlace
        { wch: 15 }, // Fecha Agregado
        { wch: 20 }  // Término de Búsqueda
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja principal
      XLSX.utils.book_append_sheet(wb, ws, 'Cotización');

      // Crear hoja de resumen
      const summaryData = [
        ['RESUMEN DE COTIZACIÓN', ''],
        ['Proyecto:', projectName || 'No especificado'],
        ['Cliente:', clientName || 'No especificado'],
        ['Fecha de Exportación:', new Date().toLocaleDateString()],
        ['Total de Productos:', cartItems.length],
        ['Cantidad Total:', cartItems.reduce((total, item) => total + item.quantity, 0)],
        [''],
        ['CATEGORÍAS:', ''],
        ...getCategorieSummary(),
        [''],
        ['INSTRUCCIONES DE USO:', ''],
        ['1. Revisa cada producto y precio', ''],
        ['2. Actualiza las cantidades según necesites', ''],
        ['3. Verifica los precios con los proveedores', ''],
        ['4. Usa esta información para tu APU', ''],
        ['5. Los enlaces te llevan a los productos originales', '']
      ];

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 30 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');

      // Crear hoja de APU básica
      const apuData = [
        ['ANÁLISIS DE PRECIOS UNITARIOS (APU)', '', '', '', ''],
        ['Proyecto:', projectName || 'No especificado', '', '', ''],
        ['Partida:', 'Editar según corresponda', '', '', ''],
        ['Unidad:', 'Editar según corresponda', '', '', ''],
        [''],
        ['MATERIALES', '', '', '', ''],
        ['Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Precio Total'],
        ...cartItems.map(item => [
          item.title,
          'Editar',
          item.quantity,
          item.price !== 'Precio no disponible' ? item.price : 'Verificar',
          'Calcular'
        ]),
        [''],
        ['MANO DE OBRA', '', '', '', ''],
        ['Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Precio Total'],
        ['Agregar según necesidad', '', '', '', ''],
        [''],
        ['EQUIPOS', '', '', '', ''],
        ['Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Precio Total'],
        ['Agregar según necesidad', '', '', '', ''],
        [''],
        ['TOTAL MATERIALES:', '', '', '', '=SUMA(E8:E' + (7 + cartItems.length) + ')'],
        ['TOTAL MANO DE OBRA:', '', '', '', '0'],
        ['TOTAL EQUIPOS:', '', '', '', '0'],
        ['SUBTOTAL:', '', '', '', '=E' + (12 + cartItems.length) + '+E' + (13 + cartItems.length) + '+E' + (14 + cartItems.length)],
        ['GASTOS GENERALES (%):', '10%', '', '', '=E' + (15 + cartItems.length) + '*0.1'],
        ['UTILIDAD (%):', '15%', '', '', '=E' + (15 + cartItems.length) + '*0.15'],
        ['PRECIO UNITARIO TOTAL:', '', '', '', '=E' + (15 + cartItems.length) + '+E' + (16 + cartItems.length) + '+E' + (17 + cartItems.length)]
      ];

      const apuWs = XLSX.utils.aoa_to_sheet(apuData);
      apuWs['!cols'] = [{ wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, apuWs, 'APU Base');

      // Guardar archivo
      const fileName = `Cotizacion_${projectName || 'Proyecto'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar el archivo. Intenta nuevamente.');
    } finally {
      setExportLoading(false);
    }
  };

  const getCategorieSummary = () => {
    const categories = {};
    cartItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + item.quantity;
    });
    return Object.entries(categories).map(([category, count]) => [category, count]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Información copiada al portapapeles');
    });
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">🛒 Carrito de Cotizaciones ({cartItems.length})</h2>
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
              <p className="text-gray-400 mt-2">Agrega materiales desde el buscador</p>
            </div>
          ) : (
            <>
              {/* Información del proyecto */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Información del Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Proyecto
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Ej: Construcción Casa Particular"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Imagen y info básica */}
                      <div className="flex-shrink-0 lg:w-64">
                        {item.thumbnail && (
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-md mb-2"
                          />
                        )}
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-lg font-bold text-green-600 mt-1">{item.price}</p>
                        <p className="text-xs text-gray-500">{item.source}</p>
                      </div>

                      {/* Controles */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Categoría
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="General">General</option>
                            <option value="Estructura">Estructura</option>
                            <option value="Albañilería">Albañilería</option>
                            <option value="Instalaciones">Instalaciones</option>
                            <option value="Terminaciones">Terminaciones</option>
                            <option value="Herramientas">Herramientas</option>
                            <option value="Otros">Otros</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas
                          </label>
                          <textarea
                            value={item.notes}
                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                            placeholder="Especificaciones, observaciones, etc."
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex-shrink-0 flex flex-row lg:flex-col gap-2">
                        <button
                          onClick={() => copyToClipboard(`${item.title} - ${item.price} - ${item.source}`)}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          📋 Copiar
                        </button>
                        <button
                          onClick={() => window.open(item.link, '_blank')}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          🔗 Ver
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="bg-gray-50 p-4 border-t">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
              <div className="text-sm text-gray-600">
                Total: {cartItems.reduce((total, item) => total + item.quantity, 0)} productos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Limpiar Carrito
                </button>
                <button
                  onClick={exportToExcel}
                  disabled={exportLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CotizacionCart;
