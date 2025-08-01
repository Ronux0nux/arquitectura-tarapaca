// Servicio para manejar datos de proveedores desde CSV
class CSVProviderService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  // Obtener todos los proveedores desde CSV
  async getAllCSVProviders() {
    try {
      const response = await fetch(`${this.baseURL}/csv-providers`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo proveedores CSV:', error);
      throw error;
    }
  }

  // Buscar proveedores en CSV
  async searchCSVProviders(searchTerm, limit = 50) {
    try {
      const response = await fetch(
        `${this.baseURL}/csv-providers/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error buscando proveedores CSV:', error);
      throw error;
    }
  }

  // Obtener estadísticas de archivos CSV
  async getCSVStats() {
    try {
      const response = await fetch(`${this.baseURL}/csv-providers/stats`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas CSV:', error);
      throw error;
    }
  }

  // Formatear datos para mostrar en tabla
  formatProviderData(providers) {
    return providers.map(provider => ({
      id: provider.id,
      nombre: provider.fullName,
      rut: provider.rut || 'No disponible',
      profesion: provider.profession || 'No especificada',
      fecha: provider.date || 'No disponible',
      archivo: provider.fileName,
      fechaImportacion: new Date(provider.importDate).toLocaleDateString('es-ES')
    }));
  }

  // Agrupar proveedores por archivo
  groupByFile(providers) {
    const grouped = {};
    providers.forEach(provider => {
      const fileName = provider.fileName;
      if (!grouped[fileName]) {
        grouped[fileName] = [];
      }
      grouped[fileName].push(provider);
    });
    return grouped;
  }

  // Obtener estadísticas rápidas de los datos
  getQuickStats(providers) {
    const withRUT = providers.filter(p => p.rut && p.rut !== '').length;
    const withProfession = providers.filter(p => p.profession && p.profession !== '').length;
    const withDate = providers.filter(p => p.date && p.date !== '').length;
    
    return {
      total: providers.length,
      conRUT: withRUT,
      conProfesion: withProfession,
      conFecha: withDate,
      porcentajeCompletos: Math.round((withRUT / providers.length) * 100)
    };
  }

  // Validar datos de proveedor
  validateProvider(provider) {
    const errors = [];
    
    if (!provider.fullName || provider.fullName.trim() === '' || provider.fullName === 'Sin nombre') {
      errors.push('Nombre requerido');
    }
    
    if (provider.rut && !this.isValidRUT(provider.rut)) {
      errors.push('RUT inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Validar formato de RUT chileno
  isValidRUT(rut) {
    if (!rut) return false;
    
    // Formato esperado: XX.XXX.XXX-X
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    if (!rutRegex.test(rut)) return false;
    
    // Extraer números y dígito verificador
    const cleanRut = rut.replace(/\./g, '').replace('-', '');
    const numbers = cleanRut.slice(0, -1);
    const checkDigit = cleanRut.slice(-1).toUpperCase();
    
    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;
    
    for (let i = numbers.length - 1; i >= 0; i--) {
      sum += parseInt(numbers[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const remainder = sum % 11;
    const calculatedDigit = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'K' : (11 - remainder).toString());
    
    return calculatedDigit === checkDigit;
  }

  // Exportar datos a CSV
  exportToCSV(providers, filename = 'proveedores_csv_export.csv') {
    const headers = ['ID', 'Nombre Completo', 'RUT', 'Profesión', 'Fecha', 'Archivo Origen'];
    const csvContent = [
      headers.join(','),
      ...providers.map(provider => [
        provider.id,
        `"${provider.fullName}"`,
        provider.rut,
        `"${provider.profession}"`,
        provider.date,
        `"${provider.fileName}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default new CSVProviderService();
