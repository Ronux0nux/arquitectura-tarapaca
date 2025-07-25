const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelController {
  constructor() {
    // Ya no necesitamos paths de archivos físicos
    this.tempDir = path.join(__dirname, '../../../temp');
    
    // Crear carpeta temporal si no existe
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Crear plantillas Excel desde cero
  async getExcelTemplate(req, res) {
    try {
      const { projectId } = req.query;
      
      // Generar plantillas con headers predefinidos
      const sheets = {
        'PRESUPUESTO': this.createPresupuestoTemplate(),
        'APU': this.createAPUTemplate(),
        'RECURSOS': this.createRecursosTemplate()
      };

      res.json({
        success: true,
        data: {
          sheets,
          sheetNames: ['PRESUPUESTO', 'APU', 'RECURSOS'],
          projectId: projectId || null,
          metadata: {
            created: new Date().toISOString(),
            template: true
          }
        }
      });

    } catch (error) {
      console.error('Error creando plantillas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al crear plantillas Excel',
        error: error.message 
      });
    }
  }

  // Crear plantilla de Presupuesto
  createPresupuestoTemplate() {
    return [
      ['ITEM', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'PRECIO UNITARIO', 'PRECIO TOTAL', 'PROVEEDOR', 'CATEGORÍA', 'PROYECTO'],
      ['1', 'Ejemplo: Cemento Portland', 'Sacos', '10', '8500', '85000', 'Proveedor A', 'Materiales Básicos', ''],
      ['2', '', '', '', '', '', '', '', ''],
      ['3', '', '', '', '', '', '', '', ''],
      ['', '', '', '', 'TOTAL:', '=SUM(F2:F100)', '', '', '']
    ];
  }

  // Crear plantilla de APU
  createAPUTemplate() {
    return [
      ['ACTIVIDAD', 'DESCRIPCIÓN RECURSO', 'TIPO', 'UNIDAD', 'CANTIDAD', 'PRECIO UNITARIO', 'PRECIO TOTAL', 'PROVEEDOR'],
      ['EXCAVACIÓN', 'Ejemplo: Operario', 'MANO DE OBRA', 'Jornal', '2', '35000', '70000', 'Contratista A'],
      ['EXCAVACIÓN', 'Ejemplo: Excavadora', 'EQUIPO', 'Hora', '4', '25000', '100000', 'Arriendo B'],
      ['EXCAVACIÓN', 'Ejemplo: Combustible', 'MATERIAL', 'Litros', '50', '850', '42500', 'Estación C'],
      ['', '', '', '', '', 'SUBTOTAL:', '=SUM(G2:G100)', ''],
      ['', '', '', '', '', 'TOTAL ACTIVIDAD:', '=G5', '']
    ];
  }

  // Crear plantilla de Recursos
  createRecursosTemplate() {
    return [
      ['CÓDIGO', 'DESCRIPCIÓN', 'UNIDAD', 'PRECIO UNITARIO', 'PROVEEDOR', 'CATEGORÍA', 'ÚLTIMA ACTUALIZACIÓN', 'ORIGEN'],
      ['MAT001', 'Ejemplo: Ladrillo Princesa', 'Unidad', '450', 'Ladrillería Sur', 'Albañilería', new Date().toLocaleDateString(), 'SERPAPI'],
      ['MAT002', '', '', '', '', '', '', ''],
      ['MAT003', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']
    ];
  }

  // Guardar datos del Excel (simplificado para trabajar en memoria)
  async saveExcelData(req, res) {
    try {
      // En esta versión simplificada, solo confirmamos que los datos se recibieron
      const { sheets, sheetNames } = req.body;

      res.json({
        success: true,
        message: 'Datos procesados exitosamente (en memoria)',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error procesando datos Excel:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al procesar datos Excel',
        error: error.message 
      });
    }
  }

  // Agregar datos del dataset al Excel
  async addDatasetToExcel(req, res) {
    try {
      const { 
        sheetName = 'RECURSOS', 
        products, 
        startRow = null,
        format = 'recursos',
        projectId = null 
      } = req.body;

      // Obtener datos actuales de la plantilla
      const currentData = this.getCurrentSheetData(sheetName);
      
      // Formatear productos según el tipo
      const formattedData = this.formatProductsForExcel(products, format, projectId);

      // Determinar donde insertar los datos (después de los headers)
      const insertRow = startRow || currentData.length;

      // Insertar datos
      formattedData.forEach((row, index) => {
        currentData[insertRow + index] = row;
      });

      res.json({
        success: true,
        message: `${products.length} productos agregados a ${sheetName}`,
        rowsAdded: formattedData.length,
        startRow: insertRow,
        data: currentData
      });

    } catch (error) {
      console.error('Error agregando dataset:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al agregar dataset al Excel',
        error: error.message 
      });
    }
  }

  // Obtener datos actuales de una hoja
  getCurrentSheetData(sheetName) {
    switch (sheetName) {
      case 'PRESUPUESTO':
        return this.createPresupuestoTemplate();
      case 'APU':
        return this.createAPUTemplate();
      case 'RECURSOS':
        return this.createRecursosTemplate();
      default:
        return [['Columna 1', 'Columna 2', 'Columna 3']];
    }
  }

  // Formatear productos según el tipo de hoja
  formatProductsForExcel(products, format, projectId = null) {
    switch (format) {
      case 'recursos':
        return products.map((product, index) => [
          `MAT${String(index + 1).padStart(3, '0')}`, // Código automático
          product.title || '',
          'Unidad', // Unidad por defecto
          this.extractNumericPrice(product.price) || 0,
          product.source || '',
          product.searchTerm || 'General',
          new Date().toLocaleDateString(),
          product.origenBusqueda || 'Manual'
        ]);

      case 'presupuesto':
        return products.map((product, index) => [
          index + 1, // ITEM
          product.title || '',
          'Unidad', // UNIDAD
          1, // CANTIDAD por defecto
          this.extractNumericPrice(product.price) || 0, // PRECIO UNITARIO
          this.extractNumericPrice(product.price) || 0, // PRECIO TOTAL
          product.source || '',
          product.searchTerm || 'General',
          projectId || '' // PROYECTO
        ]);

      case 'apu':
        return products.map(product => [
          'NUEVA ACTIVIDAD', // ACTIVIDAD
          product.title || '',
          'MATERIAL', // TIPO por defecto
          'Unidad', // UNIDAD
          1, // CANTIDAD
          this.extractNumericPrice(product.price) || 0, // PRECIO UNITARIO
          this.extractNumericPrice(product.price) || 0, // PRECIO TOTAL
          product.source || ''
        ]);

      default:
        return products.map(product => [
          product.title,
          product.price,
          product.source
        ]);
    }
  }

  // Extraer precio numérico de strings como "$15.082" o "15082"
  extractNumericPrice(priceString) {
    if (!priceString) return 0;
    if (typeof priceString === 'number') return priceString;
    
    // Remover símbolos y convertir a número
    const cleaned = priceString.toString()
      .replace(/[$.,\s]/g, '')
      .replace(/[^\d]/g, '');
    
    return parseInt(cleaned) || 0;
  }

  // Crear archivo temporal (no backup físico)
  async createBackup() {
    // En esta versión simplificada, no creamos backups físicos
    console.log('Backup simulado creado:', new Date().toISOString());
  }

  // Obtener lista de backups (simulada)
  async getBackups(req, res) {
    try {
      // Retornar lista vacía para compatibilidad
      res.json({
        success: true,
        backups: []
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo backups',
        error: error.message 
      });
    }
  }

  // Restaurar desde backup (simulado)
  async restoreBackup(req, res) {
    try {
      res.json({
        success: true,
        message: 'Funcionalidad de backup no disponible en esta versión'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error restaurando backup',
        error: error.message 
      });
    }
  }

  // Exportar Excel para descarga
  async exportExcel(req, res) {
    try {
      const { sheets, fileName = 'presupuesto', projectId = null } = req.body;

      // Crear nuevo workbook
      const workbook = XLSX.utils.book_new();

      // Agregar cada pestaña
      Object.keys(sheets).forEach(sheetName => {
        const sheetData = sheets[sheetName];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        
        // Aplicar estilos básicos
        this.applyExcelStyles(worksheet, sheetName);
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const finalFileName = `${fileName}_${projectId ? `proyecto_${projectId}_` : ''}${timestamp}.xlsx`;

      // Crear archivo temporal
      const tempFilePath = path.join(this.tempDir, finalFileName);
      XLSX.writeFile(workbook, tempFilePath);

      // Enviar archivo
      res.download(tempFilePath, finalFileName, (err) => {
        if (err) {
          console.error('Error enviando archivo:', err);
        }
        
        // Limpiar archivo temporal después de enviar
        setTimeout(() => {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }, 10000); // 10 segundos
      });

    } catch (error) {
      console.error('Error exportando Excel:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al exportar Excel',
        error: error.message 
      });
    }
  }

  // Aplicar estilos básicos al Excel
  applyExcelStyles(worksheet, sheetName) {
    if (!worksheet['!ref']) return;
    
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Aplicar estilos a los headers (primera fila)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center" }
      };
    }

    // Establecer anchos de columna
    const colWidths = this.getColumnWidths(sheetName);
    worksheet['!cols'] = colWidths;
  }

  // Obtener anchos de columna por tipo de hoja
  getColumnWidths(sheetName) {
    switch (sheetName) {
      case 'PRESUPUESTO':
        return [
          { width: 8 },   // ITEM
          { width: 40 },  // DESCRIPCIÓN
          { width: 12 },  // UNIDAD
          { width: 12 },  // CANTIDAD
          { width: 15 },  // PRECIO UNITARIO
          { width: 15 },  // PRECIO TOTAL
          { width: 20 },  // PROVEEDOR
          { width: 15 },  // CATEGORÍA
          { width: 15 }   // PROYECTO
        ];
      case 'APU':
        return [
          { width: 20 },  // ACTIVIDAD
          { width: 35 },  // DESCRIPCIÓN RECURSO
          { width: 15 },  // TIPO
          { width: 10 },  // UNIDAD
          { width: 12 },  // CANTIDAD
          { width: 15 },  // PRECIO UNITARIO
          { width: 15 },  // PRECIO TOTAL
          { width: 20 }   // PROVEEDOR
        ];
      case 'RECURSOS':
        return [
          { width: 10 },  // CÓDIGO
          { width: 35 },  // DESCRIPCIÓN
          { width: 10 },  // UNIDAD
          { width: 15 },  // PRECIO UNITARIO
          { width: 20 },  // PROVEEDOR
          { width: 15 },  // CATEGORÍA
          { width: 15 },  // ÚLTIMA ACTUALIZACIÓN
          { width: 12 }   // ORIGEN
        ];
      default:
        return [{ width: 20 }];
    }
  }
}

module.exports = new ExcelController();
