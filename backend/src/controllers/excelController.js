const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelController {
  constructor() {
    this.excelPath = path.join(__dirname, '../../../cotizaciones manual/Libro2.xlsx');
    this.backupPath = path.join(__dirname, '../../../cotizaciones manual/backups');
    
    // Crear carpeta de backups si no existe
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  // Leer archivo Excel y retornar todas las pestañas
  async getExcelData(req, res) {
    try {
      if (!fs.existsSync(this.excelPath)) {
        return res.status(404).json({ 
          success: false, 
          message: 'Archivo Excel no encontrado' 
        });
      }

      const workbook = XLSX.readFile(this.excelPath);
      const sheets = {};

      // Leer todas las pestañas
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,  // Usar números como headers para mantener formato
          defval: ''  // Valor por defecto para celdas vacías
        });
      });

      res.json({
        success: true,
        data: {
          sheets,
          sheetNames: workbook.SheetNames,
          metadata: {
            lastModified: fs.statSync(this.excelPath).mtime,
            size: fs.statSync(this.excelPath).size
          }
        }
      });

    } catch (error) {
      console.error('Error leyendo Excel:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al leer archivo Excel',
        error: error.message 
      });
    }
  }

  // Guardar datos actualizados en Excel
  async saveExcelData(req, res) {
    try {
      const { sheets, sheetNames } = req.body;

      // Crear backup antes de guardar
      await this.createBackup();

      // Crear nuevo workbook
      const workbook = XLSX.utils.book_new();

      // Agregar cada pestaña
      sheetNames.forEach(sheetName => {
        const sheetData = sheets[sheetName];
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // Guardar archivo
      XLSX.writeFile(workbook, this.excelPath);

      res.json({
        success: true,
        message: 'Archivo Excel guardado exitosamente',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error guardando Excel:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error al guardar archivo Excel',
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
        format = 'recursos' // 'recursos', 'ppto', 'apu'
      } = req.body;

      const workbook = XLSX.readFile(this.excelPath);
      
      // Obtener la hoja o crear una nueva
      let worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        worksheet = XLSX.utils.aoa_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }

      // Convertir hoja a array para manipular
      const currentData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      // Formatear productos según el tipo
      const formattedData = this.formatProductsForExcel(products, format);

      // Determinar donde insertar los datos
      const insertRow = startRow || currentData.length;

      // Insertar datos
      formattedData.forEach((row, index) => {
        currentData[insertRow + index] = row;
      });

      // Actualizar la hoja
      const newWorksheet = XLSX.utils.aoa_to_sheet(currentData);
      workbook.Sheets[sheetName] = newWorksheet;

      // Guardar
      XLSX.writeFile(workbook, this.excelPath);

      res.json({
        success: true,
        message: `${products.length} productos agregados a ${sheetName}`,
        rowsAdded: formattedData.length,
        startRow: insertRow
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

  // Formatear productos según el tipo de hoja
  formatProductsForExcel(products, format) {
    switch (format) {
      case 'recursos':
        return products.map(product => [
          product.title || '',
          product.source || '',
          this.extractNumericPrice(product.price) || 0,
          product.searchTerm || '',
          new Date().toLocaleDateString(),
          product.origenBusqueda || 'Manual'
        ]);

      case 'ppto':
        return products.map((product, index) => [
          index + 1, // Item
          product.title || '',
          1, // Cantidad por defecto
          this.extractNumericPrice(product.price) || 0,
          this.extractNumericPrice(product.price) || 0, // Precio total
          product.source || '',
          product.searchTerm || ''
        ]);

      case 'apu':
        return products.map(product => [
          product.title || '',
          'MATERIAL', // Tipo por defecto
          1, // Cantidad
          'UND', // Unidad por defecto
          this.extractNumericPrice(product.price) || 0,
          this.extractNumericPrice(product.price) || 0, // Precio total
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

  // Crear backup del archivo actual
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `Libro2_backup_${timestamp}.xlsx`;
    const backupFullPath = path.join(this.backupPath, backupName);
    
    fs.copyFileSync(this.excelPath, backupFullPath);
    
    // Mantener solo los últimos 10 backups
    const backups = fs.readdirSync(this.backupPath)
      .filter(file => file.startsWith('Libro2_backup_'))
      .sort()
      .reverse();
      
    if (backups.length > 10) {
      backups.slice(10).forEach(oldBackup => {
        fs.unlinkSync(path.join(this.backupPath, oldBackup));
      });
    }
  }

  // Obtener lista de backups
  async getBackups(req, res) {
    try {
      const backups = fs.readdirSync(this.backupPath)
        .filter(file => file.startsWith('Libro2_backup_'))
        .map(file => ({
          name: file,
          date: fs.statSync(path.join(this.backupPath, file)).mtime,
          size: fs.statSync(path.join(this.backupPath, file)).size
        }))
        .sort((a, b) => b.date - a.date);

      res.json({
        success: true,
        backups
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error obteniendo backups',
        error: error.message 
      });
    }
  }

  // Restaurar desde backup
  async restoreBackup(req, res) {
    try {
      const { backupName } = req.params;
      const backupFullPath = path.join(this.backupPath, backupName);
      
      if (!fs.existsSync(backupFullPath)) {
        return res.status(404).json({
          success: false,
          message: 'Backup no encontrado'
        });
      }

      fs.copyFileSync(backupFullPath, this.excelPath);

      res.json({
        success: true,
        message: `Archivo restaurado desde ${backupName}`
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error restaurando backup',
        error: error.message 
      });
    }
  }
}

module.exports = new ExcelController();
