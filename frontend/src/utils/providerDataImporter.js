class ProviderDataImporter {
  
  // Load providers from localStorage
  static loadProvidersFromLocalStorage() {
    try {
      const storedProviders = localStorage.getItem('importedProviders');
      if (!storedProviders) {
        return [];
      }
      return JSON.parse(storedProviders);
    } catch (error) {
      console.error('Error loading providers from localStorage:', error);
      return [];
    }
  }

  // Save providers to localStorage
  static saveProvidersToLocalStorage(providers) {
    try {
      localStorage.setItem('importedProviders', JSON.stringify(providers));
      localStorage.setItem('providersImportDate', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error saving providers to localStorage:', error);
      return false;
    }
  }

  // Process raw text data from PDF
  static processRawProviderData(rawText) {
    const providers = [];
    const lines = rawText.split('\n').filter(line => line.trim());
    
    let currentProvider = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Try to extract provider information
      // Look for names (usually start with uppercase letters)
      if (this.isProviderName(line)) {
        // Save previous provider if exists
        if (currentProvider.name) {
          providers.push(this.normalizeProvider(currentProvider));
        }
        
        currentProvider = {
          name: line,
          categories: ['General'],
          description: `Proveedor importado: ${line}`,
          status: 'activo',
          rating: Math.floor(Math.random() * 3) + 3, // Random rating 3-5
          address: '',
          phone: '',
          email: '',
          website: ''
        };
      }
      
      // Extract phone numbers
      const phoneMatch = line.match(/(\+?56\s?[0-9]\s?[0-9]{8}|[0-9]{8,9})/);
      if (phoneMatch && !currentProvider.phone) {
        currentProvider.phone = phoneMatch[0];
      }
      
      // Extract emails
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !currentProvider.email) {
        currentProvider.email = emailMatch[0];
      }
      
      // Extract addresses (lines containing street indicators)
      if (this.isAddress(line) && !currentProvider.address) {
        currentProvider.address = line;
      }
    }
    
    // Add the last provider
    if (currentProvider.name) {
      providers.push(this.normalizeProvider(currentProvider));
    }
    
    return providers;
  }

  // Process CSV data
  static processCsvProviderData(csvText) {
    const providers = [];
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('nombre') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',').map(col => col.trim().replace(/['"]/g, ''));
      
      if (columns.length >= 1) {
        const provider = {
          name: columns[0] || `Proveedor ${i}`,
          phone: columns[1] || '',
          email: columns[2] || '',
          address: columns[3] || '',
          website: columns[4] || '',
          categories: columns[5] ? columns[5].split(';').map(cat => cat.trim()) : ['General'],
          description: columns[6] || `Proveedor importado desde CSV`,
          status: 'activo',
          rating: Math.floor(Math.random() * 3) + 3
        };
        
        providers.push(this.normalizeProvider(provider));
      }
    }
    
    return providers;
  }

  // Process JSON data
  static processJsonProviderData(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      const providers = Array.isArray(data) ? data : [data];
      
      return providers.map(provider => this.normalizeProvider({
        name: provider.nombre || provider.name || 'Proveedor sin nombre',
        phone: provider.telefono || provider.phone || '',
        email: provider.email || '',
        address: provider.direccion || provider.address || '',
        website: provider.sitioWeb || provider.website || '',
        categories: provider.categorias || provider.categories || ['General'],
        description: provider.descripcion || provider.description || 'Proveedor importado desde JSON',
        status: provider.estado || provider.status || 'activo',
        rating: provider.rating || Math.floor(Math.random() * 3) + 3
      }));
    } catch (error) {
      throw new Error('JSON inválido: ' + error.message);
    }
  }

  // Validate providers
  static validateProviders(providers) {
    const errors = [];
    const warnings = [];
    let validProviders = 0;
    
    if (!Array.isArray(providers)) {
      errors.push('Los datos deben ser un arreglo de proveedores');
      return { isValid: false, errors, warnings, validProviders };
    }
    
    if (providers.length === 0) {
      errors.push('No se encontraron proveedores válidos');
      return { isValid: false, errors, warnings, validProviders };
    }
    
    providers.forEach((provider, index) => {
      if (!provider.name || provider.name.trim() === '') {
        warnings.push(`Proveedor #${index + 1} sin nombre`);
      } else {
        validProviders++;
      }
      
      if (!provider.phone && !provider.email) {
        warnings.push(`Proveedor "${provider.name}" sin contacto`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validProviders
    };
  }

  // Helper methods
  static isProviderName(line) {
    // Check if line looks like a provider name
    return /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+/.test(line) && 
           line.length > 3 && 
           line.length < 100 &&
           !line.includes('@') &&
           !line.match(/[0-9]{7,}/);
  }

  static isAddress(line) {
    const addressKeywords = ['calle', 'avenida', 'av.', 'pasaje', 'camino', 'ruta', 'km', '#', 'nº'];
    return addressKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    ) || /[0-9]+/.test(line);
  }

  static normalizeProvider(provider) {
    return {
      id: Date.now() + Math.random(),
      name: provider.name?.trim() || 'Sin nombre',
      fullName: provider.name?.trim() || 'Sin nombre',
      phone: provider.phone?.trim() || '',
      email: provider.email?.trim() || '',
      address: provider.address?.trim() || '',
      website: provider.website?.trim() || '',
      categories: Array.isArray(provider.categories) ? provider.categories : ['General'],
      description: provider.description?.trim() || 'Proveedor importado',
      status: provider.status || 'activo',
      rating: typeof provider.rating === 'number' ? provider.rating : 4,
      importDate: new Date().toISOString()
    };
  }
}

export default ProviderDataImporter;
