/**
 * Servicio para manejo de PDFs masivos (9693+ páginas)
 * Permite cargar, indexar y buscar en PDFs grandes
 */

class PDFMassiveService {
  constructor() {
    this.STORAGE_KEY = 'massivePDFData';
    this.CACHE_KEY = 'pdfSearchCache';
    this.maxCacheSize = 1000; // Máximo de búsquedas en caché
  }

  /**
   * Procesar archivo PDF masivo
   * @param {File} file - Archivo PDF
   * @returns {Promise<Object>} Datos del PDF procesado
   */
  async processPDFFile(file) {
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Archivo debe ser un PDF válido');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // En un entorno real, aquí usarías una librería como pdf-lib o PDF.js
      // Por ahora simularemos el procesamiento basado en el tamaño del archivo
      const totalPages = this.estimatePagesFromSize(file.size);
      
      const pdfData = {
        fileName: file.name,
        originalSize: file.size,
        totalPages: totalPages,
        processDate: new Date().toISOString(),
        version: '1.0',
        sections: this.generateSectionMap(totalPages),
        searchIndex: this.generateSearchIndex(totalPages)
      };

      // Guardar datos
      this.savePDFData(pdfData);
      
      return pdfData;
      
    } catch (error) {
      throw new Error(`Error procesando PDF: ${error.message}`);
    }
  }

  /**
   * Estimar número de páginas basado en el tamaño del archivo
   * @param {number} fileSize - Tamaño en bytes
   * @returns {number} Número estimado de páginas
   */
  estimatePagesFromSize(fileSize) {
    // Estimación basada en PDFs típicos de proveedores
    const avgBytesPerPage = 1024 * 100; // ~100KB por página promedio
    return Math.ceil(fileSize / avgBytesPerPage);
  }

  /**
   * Generar mapa de secciones del PDF
   * @param {number} totalPages - Total de páginas
   * @returns {Object} Mapa de secciones
   */
  generateSectionMap(totalPages) {
    const sections = {
      index: { start: 1, end: 50, title: 'Índice General' },
      providers_a_d: { start: 51, end: Math.floor(totalPages * 0.15), title: 'Proveedores A-D' },
      providers_e_h: { start: Math.floor(totalPages * 0.15) + 1, end: Math.floor(totalPages * 0.3), title: 'Proveedores E-H' },
      providers_i_l: { start: Math.floor(totalPages * 0.3) + 1, end: Math.floor(totalPages * 0.45), title: 'Proveedores I-L' },
      providers_m_p: { start: Math.floor(totalPages * 0.45) + 1, end: Math.floor(totalPages * 0.6), title: 'Proveedores M-P' },
      providers_q_t: { start: Math.floor(totalPages * 0.6) + 1, end: Math.floor(totalPages * 0.75), title: 'Proveedores Q-T' },
      providers_u_z: { start: Math.floor(totalPages * 0.75) + 1, end: Math.floor(totalPages * 0.9), title: 'Proveedores U-Z' },
      annexes: { start: Math.floor(totalPages * 0.9) + 1, end: Math.floor(totalPages * 0.95), title: 'Anexos' },
      references: { start: Math.floor(totalPages * 0.95) + 1, end: totalPages, title: 'Referencias' }
    };

    return sections;
  }

  /**
   * Generar índice de búsqueda
   * @param {number} totalPages - Total de páginas
   * @returns {Object} Índice de búsqueda
   */
  generateSearchIndex(totalPages) {
    const index = {};
    
    // Generar contenido por páginas
    for (let page = 1; page <= totalPages; page++) {
      const section = this.getPageSection(page, totalPages);
      index[page] = this.generatePageContent(page, section);
    }

    return index;
  }

  /**
   * Obtener sección de una página específica
   * @param {number} page - Número de página
   * @param {number} totalPages - Total de páginas
   * @returns {string} Nombre de la sección
   */
  getPageSection(page, totalPages) {
    if (page <= 50) return 'index';
    if (page <= Math.floor(totalPages * 0.15)) return 'providers_a_d';
    if (page <= Math.floor(totalPages * 0.3)) return 'providers_e_h';
    if (page <= Math.floor(totalPages * 0.45)) return 'providers_i_l';
    if (page <= Math.floor(totalPages * 0.6)) return 'providers_m_p';
    if (page <= Math.floor(totalPages * 0.75)) return 'providers_q_t';
    if (page <= Math.floor(totalPages * 0.9)) return 'providers_u_z';
    if (page <= Math.floor(totalPages * 0.95)) return 'annexes';
    return 'references';
  }

  /**
   * Generar contenido de página específico
   * @param {number} page - Número de página
   * @param {string} section - Sección de la página
   * @returns {Object} Contenido de la página
   */
  generatePageContent(page, section) {
    const baseCompanies = this.generateCompanyNames(page);
    
    const content = {
      page: page,
      section: section,
      companies: baseCompanies,
      content: this.generatePageText(page, section, baseCompanies),
      keywords: [...baseCompanies, section, `página_${page}`],
      hasContact: section.startsWith('providers'),
      providerCount: section.startsWith('providers') ? Math.floor(Math.random() * 5) + 1 : 0
    };

    return content;
  }

  /**
   * Generar nombres de empresas para una página
   * @param {number} page - Número de página
   * @returns {Array<string>} Lista de nombres de empresas
   */
  generateCompanyNames(page) {
    const companySuffixes = ['S.A.', 'Ltda.', 'SPA', 'EIRL', 'S.A.C.', 'CIA'];
    const businessTypes = [
      'Construcción', 'Materiales', 'Servicios', 'Ingeniería', 'Arquitectura',
      'Electricidad', 'Plomería', 'Pinturas', 'Ferretería', 'Maquinaria',
      'Transporte', 'Logística', 'Seguridad', 'Limpieza', 'Informática'
    ];
    
    const companies = [];
    const companiesPerPage = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < companiesPerPage; i++) {
      const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
      const suffix = companySuffixes[Math.floor(Math.random() * companySuffixes.length)];
      const number = page + i;
      
      companies.push(`${businessType} Norte ${number} ${suffix}`);
    }
    
    return companies;
  }

  /**
   * Generar texto de página
   * @param {number} page - Número de página
   * @param {string} section - Sección
   * @param {Array<string>} companies - Lista de empresas
   * @returns {string} Texto de la página
   */
  generatePageText(page, section, companies) {
    if (section === 'index') {
      return `Índice General - Página ${page}\nDirectorio de Proveedores de la Región de Tarapacá\nContenido actualizado al 2025`;
    }
    
    if (section.startsWith('providers')) {
      const companiesText = companies.map(company => {
        return `${company}\nDirección: Av. Principal ${page * 10}, Iquique\nTeléfono: +56 57 ${200000 + page}\nEmail: contacto@empresa${page}.cl\nRubro: Construcción y Servicios\nRUT: ${12000000 + page}-K\n`;
      }).join('\n');
      
      return `Sección de Proveedores - Página ${page}\n${companiesText}`;
    }
    
    if (section === 'annexes') {
      return `Anexos - Página ${page}\nDocumentación complementaria\nFormatos de cotización\nTerminos y condiciones`;
    }
    
    return `Referencias - Página ${page}\nÍndice alfabético\nÍndice por rubro\nContactos adicionales`;
  }

  /**
   * Buscar contenido en el PDF
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones de búsqueda
   * @returns {Array<Object>} Resultados de búsqueda
   */
  searchContent(searchTerm, options = {}) {
    const pdfData = this.loadPDFData();
    if (!pdfData || !pdfData.searchIndex) {
      return [];
    }

    const {
      exactMatch = false,
      section = null,
      limit = 50,
      includeContext = true
    } = options;

    const results = [];
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) return results;

    // Verificar caché
    const cacheKey = `${term}_${JSON.stringify(options)}`;
    const cachedResults = this.getFromCache(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    Object.entries(pdfData.searchIndex).forEach(([pageNum, pageData]) => {
      const page = parseInt(pageNum);
      
      // Filtrar por sección si se especifica
      if (section && pageData.section !== section) {
        return;
      }

      let matches = [];
      
      // Buscar en contenido
      if (exactMatch) {
        if (pageData.content.toLowerCase().includes(term)) {
          matches.push({
            type: 'content',
            text: pageData.content,
            position: pageData.content.toLowerCase().indexOf(term)
          });
        }
      } else {
        // Búsqueda por palabras
        const words = term.split(' ');
        const contentLower = pageData.content.toLowerCase();
        
        if (words.every(word => contentLower.includes(word))) {
          matches.push({
            type: 'content',
            text: pageData.content,
            position: 0
          });
        }
      }

      // Buscar en nombres de empresas
      pageData.companies.forEach((company, index) => {
        if (company.toLowerCase().includes(term)) {
          matches.push({
            type: 'company',
            text: company,
            position: index
          });
        }
      });

      // Buscar en palabras clave
      pageData.keywords.forEach((keyword, index) => {
        if (keyword.toLowerCase().includes(term)) {
          matches.push({
            type: 'keyword',
            text: keyword,
            position: index
          });
        }
      });

      // Agregar resultados si hay coincidencias
      if (matches.length > 0) {
        results.push({
          page: page,
          section: pageData.section,
          matches: matches,
          companies: pageData.companies,
          providerCount: pageData.providerCount,
          relevance: this.calculateRelevance(matches, term),
          context: includeContext ? this.extractContext(pageData.content, term) : null
        });
      }
    });

    // Ordenar por relevancia
    results.sort((a, b) => b.relevance - a.relevance);
    
    // Limitar resultados
    const limitedResults = results.slice(0, limit);
    
    // Guardar en caché
    this.saveToCache(cacheKey, limitedResults);
    
    return limitedResults;
  }

  /**
   * Calcular relevancia de los resultados
   * @param {Array<Object>} matches - Coincidencias encontradas
   * @param {string} term - Término buscado
   * @returns {number} Puntuación de relevancia
   */
  calculateRelevance(matches, term) {
    let score = 0;
    
    matches.forEach(match => {
      switch (match.type) {
        case 'company':
          score += 10; // Mayor peso para nombres de empresas
          break;
        case 'content':
          score += 5;
          break;
        case 'keyword':
          score += 2;
          break;
      }
      
      // Bonus por coincidencia exacta
      if (match.text.toLowerCase() === term.toLowerCase()) {
        score += 15;
      }
    });

    return score;
  }

  /**
   * Extraer contexto alrededor de una coincidencia
   * @param {string} content - Contenido completo
   * @param {string} term - Término buscado
   * @returns {string} Contexto extraído
   */
  extractContext(content, term) {
    const index = content.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return content.substring(0, 200) + '...';
    
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + term.length + 100);
    
    let context = content.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < content.length) context = context + '...';
    
    return context;
  }

  /**
   * Obtener página específica
   * @param {number} pageNumber - Número de página
   * @returns {Object|null} Datos de la página
   */
  getPage(pageNumber) {
    const pdfData = this.loadPDFData();
    if (!pdfData || !pdfData.searchIndex) {
      return null;
    }

    return pdfData.searchIndex[pageNumber] || null;
  }

  /**
   * Obtener estadísticas del PDF
   * @returns {Object|null} Estadísticas
   */
  getStatistics() {
    const pdfData = this.loadPDFData();
    if (!pdfData) return null;

    const stats = {
      totalPages: pdfData.totalPages,
      totalCompanies: 0,
      sectionBreakdown: {},
      processingDate: pdfData.processDate,
      fileSize: pdfData.originalSize
    };

    // Contar empresas por sección
    Object.values(pdfData.searchIndex).forEach(pageData => {
      stats.totalCompanies += pageData.companies.length;
      
      if (!stats.sectionBreakdown[pageData.section]) {
        stats.sectionBreakdown[pageData.section] = {
          pages: 0,
          companies: 0
        };
      }
      
      stats.sectionBreakdown[pageData.section].pages++;
      stats.sectionBreakdown[pageData.section].companies += pageData.companies.length;
    });

    return stats;
  }

  /**
   * Guardar datos del PDF
   * @param {Object} pdfData - Datos a guardar
   */
  savePDFData(pdfData) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pdfData));
    } catch (error) {
      console.error('Error guardando datos del PDF:', error);
    }
  }

  /**
   * Cargar datos del PDF
   * @returns {Object|null} Datos cargados
   */
  loadPDFData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error cargando datos del PDF:', error);
      return null;
    }
  }

  /**
   * Limpiar datos del PDF
   */
  clearPDFData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CACHE_KEY);
  }

  /**
   * Guardar en caché
   * @param {string} key - Clave de caché
   * @param {any} data - Datos a guardar
   */
  saveToCache(key, data) {
    try {
      const cache = this.loadCache();
      cache[key] = {
        data: data,
        timestamp: Date.now()
      };

      // Limpiar caché viejo si excede el límite
      const keys = Object.keys(cache);
      if (keys.length > this.maxCacheSize) {
        const sortedKeys = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
        sortedKeys.slice(0, keys.length - this.maxCacheSize).forEach(oldKey => {
          delete cache[oldKey];
        });
      }

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error guardando en caché:', error);
    }
  }

  /**
   * Obtener desde caché
   * @param {string} key - Clave de caché
   * @returns {any|null} Datos del caché
   */
  getFromCache(key) {
    try {
      const cache = this.loadCache();
      const cached = cache[key];
      
      if (cached && (Date.now() - cached.timestamp < 300000)) { // 5 minutos
        return cached.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo desde caché:', error);
      return null;
    }
  }

  /**
   * Cargar caché
   * @returns {Object} Caché cargado
   */
  loadCache() {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.error('Error cargando caché:', error);
      return {};
    }
  }
}

export default new PDFMassiveService();
