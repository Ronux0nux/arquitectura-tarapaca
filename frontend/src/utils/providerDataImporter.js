// Utilidad para importar y procesar datos de proveedores desde archivos PDF/Excel
export class ProviderDataImporter {
  
  /**
   * Procesa datos de proveedores desde texto plano
   * @param {string} rawData - Datos en formato texto
   * @returns {Array} - Array de objetos de proveedores
   */
  static processRawProviderData(rawData) {
    const providers = [];
    const lines = rawData.split('\n').filter(line => line.trim());
    
    let currentProvider = null;
    
    lines.forEach(line => {
      line = line.trim();
      
      // Detectar nuevo proveedor (líneas que parecen nombres de empresa)
      if (this.isProviderName(line)) {
        if (currentProvider) {
          providers.push(this.finalizeProvider(currentProvider));
        }
        currentProvider = {
          id: this.generateId(line),
          name: line,
          icon: this.getProviderIcon(line),
          status: 'activo',
          rating: 4.0,
          categories: [],
          description: '',
          paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia'],
          deliveryTime: '3-5 días',
          minOrder: 50000,
          discount: '5% corporativo'
        };
      }
      
      // Detectar teléfono
      if (this.isPhoneNumber(line)) {
        if (currentProvider) {
          currentProvider.phone = this.formatPhoneNumber(line);
        }
      }
      
      // Detectar email
      if (this.isEmail(line)) {
        if (currentProvider) {
          currentProvider.email = line;
        }
      }
      
      // Detectar dirección
      if (this.isAddress(line)) {
        if (currentProvider) {
          currentProvider.address = line;
        }
      }
      
      // Detectar website
      if (this.isWebsite(line)) {
        if (currentProvider) {
          currentProvider.website = line;
        }
      }
      
      // Detectar categorías/servicios
      if (this.isCategory(line)) {
        if (currentProvider) {
          currentProvider.categories.push(line);
        }
      }
    });
    
    // Agregar el último proveedor
    if (currentProvider) {
      providers.push(this.finalizeProvider(currentProvider));
    }
    
    return providers;
  }
  
  /**
   * Procesa datos desde formato CSV
   * @param {string} csvData - Datos en formato CSV
   * @returns {Array} - Array de objetos de proveedores
   */
  static processCsvProviderData(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const providers = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= headers.length) {
        const provider = {
          id: this.generateId(values[0]),
          name: values[0] || '',
          phone: values[1] || '',
          email: values[2] || '',
          address: values[3] || '',
          website: values[4] || '',
          categories: values[5] ? values[5].split(';').map(c => c.trim()) : ['General'],
          description: values[6] || '',
          icon: this.getProviderIcon(values[0]),
          status: 'activo',
          rating: 4.0,
          paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia'],
          deliveryTime: '3-5 días',
          minOrder: 50000,
          discount: '5% corporativo'
        };
        providers.push(provider);
      }
    }
    
    return providers;
  }
  
  /**
   * Procesa datos desde formato JSON
   * @param {string} jsonData - Datos en formato JSON
   * @returns {Array} - Array de objetos de proveedores
   */
  static processJsonProviderData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      return data.map(item => ({
        id: this.generateId(item.nombre || item.name),
        name: item.nombre || item.name || '',
        phone: item.telefono || item.phone || '',
        email: item.email || item.correo || '',
        address: item.direccion || item.address || '',
        website: item.website || item.sitio || '',
        categories: item.categorias || item.categories || ['General'],
        description: item.descripcion || item.description || '',
        icon: this.getProviderIcon(item.nombre || item.name),
        status: item.estado || item.status || 'activo',
        rating: item.rating || 4.0,
        paymentMethods: item.metodosPago || item.paymentMethods || ['Efectivo', 'Tarjeta', 'Transferencia'],
        deliveryTime: item.tiempoEntrega || item.deliveryTime || '3-5 días',
        minOrder: item.montoMinimo || item.minOrder || 50000,
        discount: item.descuento || item.discount || '5% corporativo'
      }));
    } catch (error) {
      console.error('Error al procesar JSON:', error);
      return [];
    }
  }
  
  // Métodos auxiliares
  static isProviderName(line) {
    // Detecta si una línea es un nombre de proveedor
    return line.length > 2 && 
           line.length < 50 && 
           !this.isPhoneNumber(line) && 
           !this.isEmail(line) && 
           !this.isAddress(line) &&
           !line.includes('@') &&
           !line.includes('www.') &&
           !/^\d/.test(line);
  }
  
  static isPhoneNumber(line) {
    // Detecta números de teléfono
    return /^[\+]?[\d\s\-\(\)]{7,15}$/.test(line.replace(/\s+/g, ''));
  }
  
  static isEmail(line) {
    // Detecta emails
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line);
  }
  
  static isAddress(line) {
    // Detecta direcciones (contiene números y palabras como calle, av, etc.)
    return /\d+.*(?:calle|av|avenida|street|st|pasaje|psj)/i.test(line) ||
           (line.includes(',') && line.length > 20);
  }
  
  static isWebsite(line) {
    // Detecta sitios web
    return /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(line);
  }
  
  static isCategory(line) {
    // Detecta categorías de servicio
    const categories = ['construccion', 'herramientas', 'materiales', 'ferreteria', 'electricidad', 'plomeria', 'pintura', 'jardineria'];
    return categories.some(cat => line.toLowerCase().includes(cat));
  }
  
  static generateId(name) {
    return name.toLowerCase()
               .replace(/[^a-z0-9]/g, '')
               .substring(0, 20);
  }
  
  static formatPhoneNumber(phone) {
    // Formatea números de teléfono chilenos
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 8) {
      return `+56 ${cleaned.slice(-8, -4)} ${cleaned.slice(-4)}`;
    }
    return phone;
  }
  
  static getProviderIcon(name) {
    const icons = {
      'sodimac': '🏪',
      'easy': '🏬',
      'construmart': '🏭',
      'imperial': '🏛️',
      'homecenter': '🏠',
      'maestro': '🔨',
      'default': '🏢'
    };
    
    const nameLower = name.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (nameLower.includes(key)) {
        return icon;
      }
    }
    
    // Iconos por tipo de negocio
    if (nameLower.includes('ferreteria')) return '🔧';
    if (nameLower.includes('construccion')) return '🏗️';
    if (nameLower.includes('material')) return '🧱';
    if (nameLower.includes('herramienta')) return '🔨';
    if (nameLower.includes('pintura')) return '🎨';
    if (nameLower.includes('electricidad')) return '⚡';
    if (nameLower.includes('plomeria')) return '🔧';
    
    return icons.default;
  }
  
  static finalizeProvider(provider) {
    // Completa la información del proveedor
    if (!provider.description) {
      provider.description = `Proveedor de ${provider.categories.join(', ').toLowerCase()}`;
    }
    
    if (!provider.website && provider.name) {
      provider.website = `https://www.${provider.name.toLowerCase().replace(/\s+/g, '')}.cl`;
    }
    
    if (provider.categories.length === 0) {
      provider.categories = ['General'];
    }
    
    return provider;
  }
  
  /**
   * Guarda datos de proveedores en localStorage
   * @param {Array} providers - Array de proveedores
   */
  static saveProvidersToLocalStorage(providers) {
    localStorage.setItem('importedProviders', JSON.stringify(providers));
    localStorage.setItem('providersImportDate', new Date().toISOString());
  }
  
  /**
   * Carga datos de proveedores desde localStorage
   * @returns {Array} - Array de proveedores guardados
   */
  static loadProvidersFromLocalStorage() {
    const saved = localStorage.getItem('importedProviders');
    return saved ? JSON.parse(saved) : [];
  }
  
  /**
   * Valida la estructura de datos de proveedores
   * @param {Array} providers - Array de proveedores
   * @returns {Object} - Resultado de validación
   */
  static validateProviders(providers) {
    const errors = [];
    const warnings = [];
    
    providers.forEach((provider, index) => {
      if (!provider.name) {
        errors.push(`Proveedor ${index + 1}: Falta nombre`);
      }
      
      if (!provider.phone && !provider.email) {
        warnings.push(`${provider.name}: Sin información de contacto`);
      }
      
      if (!provider.address) {
        warnings.push(`${provider.name}: Sin dirección`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalProviders: providers.length,
      validProviders: providers.filter(p => p.name && (p.phone || p.email)).length
    };
  }
}

export default ProviderDataImporter;
