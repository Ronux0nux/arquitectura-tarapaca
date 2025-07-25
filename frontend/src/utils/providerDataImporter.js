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
    
    console.log(`Procesando ${lines.length} líneas de datos...`);
    
    lines.forEach((line, index) => {
      line = line.trim();
      if (!line) return;
      
      // Detectar patrones comunes de inicio de proveedor
      if (this.isProviderStartLine(line, index, lines)) {
        // Guardar proveedor anterior si existe
        if (currentProvider && this.isValidProvider(currentProvider)) {
          providers.push(this.finalizeProvider(currentProvider));
        }
        
        // Crear nuevo proveedor
        currentProvider = {
          id: this.generateId(line),
          name: this.cleanProviderName(line),
          icon: this.getProviderIcon(line),
          status: 'activo',
          rating: 4.0,
          categories: this.inferCategories(line),
          description: '',
          paymentMethods: ['Efectivo', 'Tarjeta', 'Transferencia'],
          deliveryTime: '3-5 días',
          minOrder: 50000,
          discount: '5% corporativo',
          phone: '',
          email: '',
          address: '',
          rut: '',
          contactPerson: '',
          website: ''
        };
      }
      
      // Procesar información adicional del proveedor actual
      if (currentProvider) {
        this.extractProviderInfo(currentProvider, line);
      }
    });
    
    // Guardar último proveedor
    if (currentProvider && this.isValidProvider(currentProvider)) {
      providers.push(this.finalizeProvider(currentProvider));
    }
    
    console.log(`Procesados ${providers.length} proveedores válidos`);
    return providers;
  }

  /**
   * Detecta si una línea es el inicio de un nuevo proveedor
   */
  static isProviderStartLine(line, index, allLines) {
    // Patrones que indican inicio de proveedor
    const patterns = [
      // Líneas con formato "NOMBRE EMPRESA LTDA" o similar
      /^[A-Z][A-Z\s&.-]{10,}(LTDA|SPA|SA|EIRL|S\.A\.|LIMITADA)\.?$/i,
      // Líneas que empiezan con número seguido de nombre
      /^\d+[\s\t]+[A-Z][A-Za-z\s&.-]{8,}/,
      // Líneas con RUT al inicio
      /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]\s+[A-Z]/i,
      // Líneas largas que parecen nombres de empresa (sin números al inicio)
      /^[A-Z][A-Za-z\s&.-]{15,}$/
    ];

    return patterns.some(pattern => pattern.test(line)) && 
           !this.isPhoneNumber(line) && 
           !this.isEmail(line) &&
           !this.isAddress(line);
  }

  /**
   * Extrae información específica del proveedor desde una línea
   */
  static extractProviderInfo(provider, line) {
    line = line.trim();
    
    // Extraer teléfono
    if (this.isPhoneNumber(line) && !provider.phone) {
      provider.phone = this.formatPhoneNumber(line);
      return;
    }
    
    // Extraer email
    if (this.isEmail(line) && !provider.email) {
      provider.email = line.toLowerCase();
      return;
    }
    
    // Extraer RUT
    if (this.isRUT(line) && !provider.rut) {
      provider.rut = this.formatRUT(line);
      return;
    }
    
    // Extraer dirección
    if (this.isAddress(line) && !provider.address) {
      provider.address = line;
      return;
    }
    
    // Extraer sitio web
    if (this.isWebsite(line) && !provider.website) {
      provider.website = line;
      return;
    }
    
    // Extraer persona de contacto
    if (this.isContactPerson(line) && !provider.contactPerson) {
      provider.contactPerson = line;
      return;
    }
    
    // Si no es ningún campo específico, agregar a descripción
    if (line.length > 10 && line.length < 200 && !provider.description) {
      provider.description = line;
    }
  }

  /**
   * Limpia y formatea el nombre del proveedor
   */
  static cleanProviderName(name) {
    return name
      .replace(/^\d+[\s\t]+/, '') // Remover números al inicio
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim()
      .replace(/\.+$/, ''); // Remover puntos al final
  }

  /**
   * Valida si un proveedor tiene información mínima necesaria
   */
  static isValidProvider(provider) {
    return provider && 
           provider.name && 
           provider.name.length >= 3 &&
           provider.name.length <= 100 &&
           !/^\d+$/.test(provider.name); // No solo números
  }

  /**
   * Detecta si una línea contiene un RUT chileno
   */
  static isRUT(line) {
    const rutPattern = /\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b/i;
    return rutPattern.test(line);
  }

  /**
   * Formatea un RUT
   */
  static formatRUT(line) {
    const match = line.match(/(\d{1,2}\.\d{3}\.\d{3}-[\dkK])/i);
    return match ? match[1].toUpperCase() : '';
  }

  /**
   * Detecta si una línea es una dirección
   */
  static isAddress(line) {
    const addressKeywords = [
      'calle', 'avenida', 'av\\.', 'pasaje', 'psje', 'camino', 'km',
      'santiago', 'valparaíso', 'concepción', 'la serena', 'antofagasta',
      'iquique', 'arica', 'temuco', 'valdivia', 'osorno', 'puerto montt',
      '\\d{4,5}', // Códigos postales
      '#\\d+', // Números de casa/oficina
    ];
    
    const pattern = new RegExp(addressKeywords.join('|'), 'i');
    return pattern.test(line) && line.length > 15 && line.length < 150;
  }

  /**
   * Detecta si una línea es un sitio web
   */
  static isWebsite(line) {
    const webPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?$/;
    return webPattern.test(line) || line.includes('www.') || line.includes('.cl') || line.includes('.com');
  }

  /**
   * Detecta si una línea es una persona de contacto
   */
  static isContactPerson(line) {
    const personPattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/;
    return personPattern.test(line) && 
           line.length >= 6 && 
           line.length <= 50 &&
           !this.isProviderName(line);
  }

  /**
   * Infiere categorías basándose en el nombre del proveedor
   */
  static inferCategories(name) {
    const categories = [];
    const nameLower = name.toLowerCase();
    
    const categoryKeywords = {
      'Construcción': ['construc', 'edifici', 'obra', 'contrat', 'inmobil'],
      'Materiales': ['material', 'ferret', 'acero', 'cement', 'pintur', 'madera'],
      'Herramientas': ['herramienta', 'equipo', 'maquinaria', 'alquiler'],
      'Servicios': ['servicio', 'consultora', 'asesor', 'manteni'],
      'Transporte': ['transport', 'logistic', 'camion', 'flete'],
      'Eléctrico': ['electric', 'cable', 'iluminac', 'energia'],
      'Plomería': ['plomer', 'sanitari', 'cañeria', 'agua'],
      'Acabados': ['pintura', 'revest', 'ceramic', 'piso', 'alfombra']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => nameLower.includes(keyword))) {
        categories.push(category);
      }
    }
    
    return categories.length > 0 ? categories : ['General'];
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
