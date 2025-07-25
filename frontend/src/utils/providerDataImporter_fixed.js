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
      '#\\d+' // Números de casa/oficina
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

  /**
   * Detecta si una línea parece el nombre de un proveedor
   */
  static isProviderName(line) {
    if (!line || line.length < 3 || line.length > 100) return false;
    
    // No debe ser solo números
    if (/^\d+$/.test(line)) return false;
    
    // No debe ser un teléfono o email
    if (this.isPhoneNumber(line) || this.isEmail(line)) return false;
    
    // Debe tener al menos una letra mayúscula
    if (!/[A-Z]/.test(line)) return false;
    
    // Patrones comunes de empresas
    const companyPatterns = [
      /LTDA|SPA|SA|EIRL|S\.A\.|LIMITADA/i,
      /^[A-Z][A-Za-z\s&.-]{8,}$/,
      /\b(EMPRESA|COMERCIAL|DISTRIBUIDORA|IMPORTADORA|EXPORTADORA)\b/i
    ];
    
    return companyPatterns.some(pattern => pattern.test(line));
  }

  /**
   * Detecta números de teléfono
   */
  static isPhoneNumber(line) {
    const phonePatterns = [
      /\+?56\s?[2-9]\s?\d{8}/,  // Teléfonos chilenos
      /\(\d{2,3}\)\s?\d{6,8}/,   // Formato (XX) XXXXXXXX
      /\d{8,10}/,                // 8-10 dígitos seguidos
      /\d{2,3}-\d{6,8}/          // XX-XXXXXXXX
    ];
    
    return phonePatterns.some(pattern => pattern.test(line.replace(/\s/g, '')));
  }

  /**
   * Detecta direcciones de email
   */
  static isEmail(line) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(line.trim());
  }

  /**
   * Formatea números de teléfono
   */
  static formatPhoneNumber(phone) {
    // Remover espacios y caracteres especiales
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Formatear según longitud
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else if (cleaned.length === 9 && cleaned.startsWith('9')) {
      return `+56 9 ${cleaned.slice(1, 5)}-${cleaned.slice(5)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('569')) {
      return `+56 9 ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone; // Devolver original si no se puede formatear
  }

  /**
   * Genera un ID único para el proveedor
   */
  static generateId(name) {
    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10);
    
    return `${baseId}_${Date.now().toString(36)}`;
  }

  /**
   * Obtiene un icono representativo para el proveedor
   */
  static getProviderIcon(name) {
    const nameLower = name.toLowerCase();
    
    const iconMap = {
      'construc': '🏗️',
      'ferret': '🔨',
      'material': '🧱',
      'electric': '⚡',
      'plomer': '🔧',
      'pintur': '🎨',
      'madera': '🪵',
      'acero': '⚙️',
      'transport': '🚛',
      'servicio': '🛠️'
    };
    
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (nameLower.includes(keyword)) {
        return icon;
      }
    }
    
    return '🏢'; // Icono por defecto
  }

  /**
   * Finaliza el procesamiento de un proveedor
   */
  static finalizeProvider(provider) {
    // Limpiar y validar datos
    provider.name = provider.name.trim();
    provider.phone = provider.phone || '';
    provider.email = provider.email || '';
    provider.address = provider.address || '';
    
    // Asignar categorías si no tiene
    if (!provider.categories || provider.categories.length === 0) {
      provider.categories = this.inferCategories(provider.name);
    }
    
    return provider;
  }
}
