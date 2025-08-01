const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Ruta base a la carpeta de resultados de cotizaciones
const CSV_FOLDER_PATH = path.join(__dirname, '../../../cotizaciones manual/resultados');

// Controlador para manejar los datos de CSV de proveedores
class CSVProviderController {
  
  // Obtener todos los archivos CSV de proveedores
  async getAllCSVProviders(req, res) {
    try {
      // Verificar que la carpeta existe
      if (!fs.existsSync(CSV_FOLDER_PATH)) {
        return res.status(404).json({ 
          error: 'Carpeta de resultados no encontrada',
          path: CSV_FOLDER_PATH
        });
      }

      // Leer todos los archivos de la carpeta
      const files = fs.readdirSync(CSV_FOLDER_PATH);
      const csvFiles = files.filter(file => 
        file.startsWith('Proveedores_Pag') && file.endsWith('.csv')
      );

      if (csvFiles.length === 0) {
        return res.status(404).json({ 
          error: 'No se encontraron archivos CSV de proveedores' 
        });
      }

      let allProviders = [];
      let processedFiles = 0;

      // Procesar cada archivo CSV
      for (const file of csvFiles) {
        const filePath = path.join(CSV_FOLDER_PATH, file);
        
        try {
          const fileData = await this.readCSVFile(filePath);
          const processedData = this.processCSVData(fileData, file);
          allProviders = allProviders.concat(processedData);
          processedFiles++;
        } catch (error) {
          console.error(`Error procesando archivo ${file}:`, error);
        }
      }

      // Eliminar duplicados basados en RUT o combinación nombre+apellido
      const uniqueProviders = this.removeDuplicates(allProviders);

      res.json({
        success: true,
        data: uniqueProviders,
        metadata: {
          totalFiles: csvFiles.length,
          processedFiles: processedFiles,
          totalProviders: allProviders.length,
          uniqueProviders: uniqueProviders.length,
          duplicatesRemoved: allProviders.length - uniqueProviders.length
        }
      });

    } catch (error) {
      console.error('Error obteniendo datos CSV:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  }

  // Leer un archivo CSV específico
  async readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  // Procesar los datos del CSV y estructurarlos
  processCSVData(data, fileName) {
    const providers = [];
    let currentProvider = {};

    data.forEach((row, index) => {
      const campo1 = row['Campo_1'] || '';
      const campo2 = row['Campo_2'] || '';
      const campo3 = row['Campo_3'] || '';
      const campo4 = row['Campo_4'] || '';

      // Detectar si es un ID numérico (nuevo proveedor)
      if (this.isNumericId(campo1)) {
        // Si ya tenemos un proveedor en construcción, lo guardamos
        if (currentProvider.id) {
          providers.push(currentProvider);
        }

        // Iniciar nuevo proveedor
        currentProvider = {
          id: campo1,
          fileName: fileName,
          rawData: [campo1, campo2, campo3, campo4]
        };

        // Si campo2 y campo3 parecen ser nombres, los asignamos
        if (this.isName(campo2) && this.isName(campo3)) {
          currentProvider.firstName = campo2;
          currentProvider.lastName = campo3;
          currentProvider.secondLastName = campo4 || '';
        }
      } else if (this.isRUT(campo1)) {
        // Es un RUT, lo asignamos al proveedor actual
        if (currentProvider.id) {
          currentProvider.rut = campo1;
          if (campo2) currentProvider.profession = campo2;
          if (campo3) currentProvider.date = campo3;
        }
      } else if (this.isName(campo1) && this.isName(campo2)) {
        // Son nombres adicionales o corrección
        if (currentProvider.id && !currentProvider.firstName) {
          currentProvider.firstName = campo1;
          currentProvider.lastName = campo2;
          if (campo3) currentProvider.secondLastName = campo3;
        }
      }
    });

    // No olvidar el último proveedor
    if (currentProvider.id) {
      providers.push(currentProvider);
    }

    // Normalizar y limpiar los datos
    return providers.map(provider => this.normalizeProvider(provider));
  }

  // Normalizar los datos del proveedor
  normalizeProvider(provider) {
    const fullName = [
      provider.firstName,
      provider.lastName,
      provider.secondLastName
    ].filter(Boolean).join(' ');

    return {
      id: provider.id,
      rut: provider.rut || '',
      fullName: fullName || 'Sin nombre',
      firstName: provider.firstName || '',
      lastName: provider.lastName || '',
      secondLastName: provider.secondLastName || '',
      profession: provider.profession || '',
      date: provider.date || '',
      fileName: provider.fileName,
      source: 'CSV_Import',
      importDate: new Date().toISOString()
    };
  }

  // Eliminar duplicados
  removeDuplicates(providers) {
    const seen = new Set();
    return providers.filter(provider => {
      // Usar RUT como clave principal, o nombre completo como alternativa
      const key = provider.rut || provider.fullName.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Verificar si es un ID numérico
  isNumericId(value) {
    return /^\d+$/.test(value?.toString().trim());
  }

  // Verificar si es un RUT
  isRUT(value) {
    return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(value?.toString().trim());
  }

  // Verificar si es un nombre
  isName(value) {
    if (!value) return false;
    const trimmed = value.toString().trim();
    return /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\s]*$/.test(trimmed) && 
           trimmed.length > 1 && 
           !this.isRUT(trimmed) && 
           !this.isNumericId(trimmed);
  }

  // Obtener estadísticas de los datos
  async getProviderStats(req, res) {
    try {
      const files = fs.readdirSync(CSV_FOLDER_PATH);
      const csvFiles = files.filter(file => 
        file.startsWith('Proveedores_Pag') && file.endsWith('.csv')
      );

      let totalRecords = 0;
      const fileStats = [];

      for (const file of csvFiles) {
        const filePath = path.join(CSV_FOLDER_PATH, file);
        const stats = fs.statSync(filePath);
        const fileData = await this.readCSVFile(filePath);
        
        fileStats.push({
          fileName: file,
          size: stats.size,
          records: fileData.length,
          lastModified: stats.mtime
        });

        totalRecords += fileData.length;
      }

      res.json({
        success: true,
        stats: {
          totalFiles: csvFiles.length,
          totalRecords: totalRecords,
          folderPath: CSV_FOLDER_PATH,
          files: fileStats.slice(0, 20) // Limitar a primeros 20 archivos para no sobrecargar
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ 
        error: 'Error obteniendo estadísticas',
        message: error.message 
      });
    }
  }

  // Buscar proveedores por término de búsqueda
  async searchProviders(req, res) {
    try {
      const { q: searchTerm, limit = 50 } = req.query;

      if (!searchTerm || searchTerm.length < 2) {
        return res.status(400).json({
          error: 'El término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      // Obtener todos los proveedores
      const allProvidersResponse = await this.getAllCSVProviders(req, { json: (data) => data });
      
      if (!allProvidersResponse.success) {
        return res.status(500).json(allProvidersResponse);
      }

      const allProviders = allProvidersResponse.data;
      const searchTermLower = searchTerm.toLowerCase();

      // Filtrar proveedores que coincidan con el término de búsqueda
      const filteredProviders = allProviders.filter(provider => {
        return (
          provider.fullName.toLowerCase().includes(searchTermLower) ||
          provider.firstName.toLowerCase().includes(searchTermLower) ||
          provider.lastName.toLowerCase().includes(searchTermLower) ||
          provider.rut.includes(searchTerm) ||
          provider.profession.toLowerCase().includes(searchTermLower)
        );
      });

      // Limitar resultados
      const limitedResults = filteredProviders.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: limitedResults,
        metadata: {
          searchTerm: searchTerm,
          totalMatches: filteredProviders.length,
          returnedResults: limitedResults.length,
          searchedIn: allProviders.length
        }
      });

    } catch (error) {
      console.error('Error buscando proveedores:', error);
      res.status(500).json({ 
        error: 'Error en la búsqueda',
        message: error.message 
      });
    }
  }
}

module.exports = new CSVProviderController();
