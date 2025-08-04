/**
 * Servicio para gestión de proveedores 
 * Basado en: ListadoProveedoresVigentes-04-08-2025.pdf
 * 
 * ESPECIFICACIONES DEL PDF REAL:
 * - Total de páginas: 9,751
 * - Estructura por página: ID, RUT Proveedor, Razón Social, Fecha Actualización
 * - Organización: Cada página contiene múltiples proveedores en filas estructuradas
 * - Estimado: Miles de proveedores reales
 */

class ProvidersListService {
  constructor() {
    this.STORAGE_KEY = 'providersListData';
    this.PDF_SOURCE = 'ListadoProveedoresVigentes-04-08-2025.pdf';
    this.PDF_PAGES = 9751;
    this.PDF_STRUCTURE = {
      fields: ['ID', 'RUT Proveedor', 'Razón Social', 'Fecha Actualización'],
      organization: 'Filas estructuradas por página',
      estimatedProviders: 'Miles'
    };
  }

  /**
   * Obtener datos de proveedores
   * NOTA: 25 datos de ejemplo hasta procesar el PDF masivo de 9,751 páginas
   */
  getExpandedProvidersData() {
    return [
      // Construcción y Edificación
      {
        id: 1,
        nombre: "CONSTRUCTORA ARICA S.A.",
        rut: "96.123.456-7",
        telefono: "+56 58 2345678",
        email: "contacto@constructoraarica.cl",
        direccion: "Av. Santa María 1234, Arica",
        categoria: "Construcción",
        especialidad: "Obras civiles, edificación residencial y comercial",
        vigente: true,
        fechaRegistro: "2025-01-15",
        certificaciones: ["ISO 9001", "OHSAS 18001"],
        empleados: "50-100",
        sitioWeb: "www.constructoraarica.cl"
      },
      {
        id: 2,
        nombre: "INGENIERÍA Y CONSTRUCCIÓN TARAPACÁ LTDA.",
        rut: "76.234.567-8",
        telefono: "+56 57 3456789",
        email: "proyectos@ingtarapaca.cl",
        direccion: "Av. Arturo Prat 567, Iquique",
        categoria: "Construcción",
        especialidad: "Proyectos industriales, obras portuarias",
        vigente: true,
        fechaRegistro: "2024-11-20",
        certificaciones: ["ISO 14001"],
        empleados: "100-250",
        sitioWeb: "www.ingtarapaca.cl"
      },
      {
        id: 3,
        nombre: "EDIFICACIONES DEL NORTE SPA",
        rut: "77.345.678-9",
        telefono: "+56 57 4567890",
        email: "ventas@edificnorte.cl",
        direccion: "Calle Lynch 890, Iquique",
        categoria: "Construcción",
        especialidad: "Edificación, remodelaciones, mantención",
        vigente: true,
        fechaRegistro: "2024-12-03",
        certificaciones: ["ISO 9001"],
        empleados: "25-50",
        sitioWeb: "www.edificnorte.cl"
      },

      // Materiales y Suministros
      {
        id: 4,
        nombre: "MATERIALES DEL NORTE LTDA.",
        rut: "76.456.789-0",
        telefono: "+56 57 5678901",
        email: "ventas@materialesnorte.cl",
        direccion: "Zona Industrial, Lote 45, Iquique",
        categoria: "Materiales",
        especialidad: "Cemento, áridos, fierro, materiales construcción",
        vigente: true,
        fechaRegistro: "2025-02-10",
        certificaciones: ["NCh 163"],
        empleados: "10-25",
        sitioWeb: "www.materialesnorte.cl"
      },
      {
        id: 5,
        nombre: "DISTRIBUIDORA ATACAMA S.A.",
        rut: "96.567.890-1",
        telefono: "+56 55 6789012",
        email: "distribución@atacama.cl",
        direccion: "Av. Pedro Valdivia 2345, Calama",
        categoria: "Materiales",
        especialidad: "Distribución materiales mineros y construcción",
        vigente: true,
        fechaRegistro: "2024-10-15",
        certificaciones: ["ISO 9001", "ISO 14001"],
        empleados: "50-100",
        sitioWeb: "www.distribuidora-atacama.cl"
      },
      {
        id: 6,
        nombre: "FERRETERÍA INDUSTRIAL PAMPA",
        rut: "14.678.901-2",
        telefono: "+56 57 7890123",
        email: "ventas@ferretpampa.cl",
        direccion: "Av. Costanera 1111, Iquique",
        categoria: "Materiales",
        especialidad: "Herramientas, ferretería industrial, repuestos",
        vigente: true,
        fechaRegistro: "2025-01-08",
        certificaciones: [],
        empleados: "5-10",
        sitioWeb: "www.ferreteriapampa.cl"
      },

      // Servicios Eléctricos
      {
        id: 7,
        nombre: "ELECTRICIDAD TARAPACÁ SPA",
        rut: "76.789.012-3",
        telefono: "+56 57 8901234",
        email: "proyectos@electarapaca.cl",
        direccion: "Av. Baquedano 456, Iquique",
        categoria: "Electricidad",
        especialidad: "Instalaciones eléctricas industriales, iluminación",
        vigente: true,
        fechaRegistro: "2024-09-22",
        certificaciones: ["SEC Clase A"],
        empleados: "25-50",
        sitioWeb: "www.electricidad-tarapaca.cl"
      },
      {
        id: 8,
        nombre: "INSTALACIONES ELÉCTRICAS DEL DESIERTO",
        rut: "15.890.123-4",
        telefono: "+56 57 9012345",
        email: "contacto@electdesierto.cl",
        direccion: "Calle Gorostiaga 789, Iquique",
        categoria: "Electricidad",
        especialidad: "Automatización, tableros eléctricos, mantención",
        vigente: true,
        fechaRegistro: "2025-03-01",
        certificaciones: ["SEC Clase B"],
        empleados: "10-25",
        sitioWeb: "www.electricidad-desierto.cl"
      },

      // Transporte y Logística
      {
        id: 9,
        nombre: "TRANSPORTES PAMPA EIRL",
        rut: "96.901.234-5",
        telefono: "+56 57 0123456",
        email: "operaciones@transportespampa.cl",
        direccion: "Zona Franca Iquique, Galpón 45",
        categoria: "Transporte",
        especialidad: "Carga pesada, transporte minero, logística",
        vigente: true,
        fechaRegistro: "2024-08-14",
        certificaciones: ["ISO 39001"],
        empleados: "100-250",
        sitioWeb: "www.transportes-pampa.cl"
      },
      {
        id: 10,
        nombre: "LOGÍSTICA INTEGRAL NORTE",
        rut: "77.012.345-6",
        telefono: "+56 57 1234567",
        email: "servicios@logisticanorte.cl",
        direccion: "Puerto de Iquique, Terminal 3",
        categoria: "Transporte",
        especialidad: "Logística portuaria, almacenaje, distribución",
        vigente: true,
        fechaRegistro: "2024-12-20",
        certificaciones: ["BASC"],
        empleados: "50-100",
        sitioWeb: "www.logistica-norte.cl"
      },

      // Servicios Mineros
      {
        id: 11,
        nombre: "SERVICIOS MINEROS ATACAMA S.A.",
        rut: "76.123.456-7",
        telefono: "+56 55 2345678",
        email: "contratos@serviciosatacama.cl",
        direccion: "Sector Industrial, Calama",
        categoria: "Minería",
        especialidad: "Servicios especializados minería, mantención equipos",
        vigente: true,
        fechaRegistro: "2025-01-25",
        certificaciones: ["ISO 45001", "ISO 14001"],
        empleados: "250-500",
        sitioWeb: "www.servicios-atacama.cl"
      },
      {
        id: 12,
        nombre: "MANTENCIÓN MINERA DEL NORTE",
        rut: "14.234.567-8",
        telefono: "+56 55 3456789",
        email: "servicios@mantminera.cl",
        direccion: "Parque Industrial Calama, Lote 67",
        categoria: "Minería",
        especialidad: "Mantención preventiva, reparaciones especializadas",
        vigente: true,
        fechaRegistro: "2024-11-05",
        certificaciones: ["ISO 9001"],
        empleados: "100-250",
        sitioWeb: "www.mantencion-minera.cl"
      },

      // Plomería y Sanitarios
      {
        id: 13,
        nombre: "PLOMERÍA Y GAS DEL DESIERTO",
        rut: "15.345.678-9",
        telefono: "+56 57 4567890",
        email: "servicios@plomerigas.cl",
        direccion: "Pasaje Bulnes 123, Iquique",
        categoria: "Plomería",
        especialidad: "Instalaciones sanitarias, gas, climatización",
        vigente: true,
        fechaRegistro: "2025-02-18",
        certificaciones: ["SEC Gas"],
        empleados: "10-25",
        sitioWeb: "www.plomeria-desierto.cl"
      },
      {
        id: 14,
        nombre: "INSTALACIONES SANITARIAS NORTE",
        rut: "96.456.789-0",
        telefono: "+56 57 5678901",
        email: "proyectos@sanitariasnorte.cl",
        direccion: "Av. Manuel Rodríguez 999, Iquique",
        categoria: "Plomería",
        especialidad: "Proyectos sanitarios industriales, piscinas",
        vigente: true,
        fechaRegistro: "2024-10-30",
        certificaciones: ["SISS"],
        empleados: "25-50",
        sitioWeb: "www.sanitarias-norte.cl"
      },

      // Ingeniería y Consultoría
      {
        id: 15,
        nombre: "INGENIERÍA CONSULTA NORTE",
        rut: "77.567.890-1",
        telefono: "+56 57 6789012",
        email: "proyectos@ingenorte.cl",
        direccion: "Centro Empresarial, Oficina 301, Iquique",
        categoria: "Ingeniería",
        especialidad: "Consultoría, proyectos industriales, estudios",
        vigente: true,
        fechaRegistro: "2025-03-10",
        certificaciones: ["Colegio Ingenieros"],
        empleados: "10-25",
        sitioWeb: "www.ingenieria-norte.cl"
      },
      {
        id: 16,
        nombre: "CONSULTORA TÉCNICA ATACAMA",
        rut: "16.678.901-2",
        telefono: "+56 55 7890123",
        email: "estudios@consultecnica.cl",
        direccion: "Av. Brasil 1234, Calama",
        categoria: "Ingeniería",
        especialidad: "Estudios técnicos, evaluación proyectos, asesoría",
        vigente: true,
        fechaRegistro: "2024-09-08",
        certificaciones: ["ISO 9001"],
        empleados: "5-10",
        sitioWeb: "www.consultora-atacama.cl"
      },

      // Servicios Especializados
      {
        id: 17,
        nombre: "SEGURIDAD INTEGRAL NORTE",
        rut: "76.789.012-3",
        telefono: "+56 57 8901234",
        email: "operaciones@seguridadnorte.cl",
        direccion: "Av. Héroes de la Concepción 555, Iquique",
        categoria: "Seguridad",
        especialidad: "Seguridad industrial, vigilancia, capacitación",
        vigente: true,
        fechaRegistro: "2025-01-12",
        certificaciones: ["OS-10"],
        empleados: "100-250",
        sitioWeb: "www.seguridad-norte.cl"
      },
      {
        id: 18,
        nombre: "LIMPIEZA INDUSTRIAL DESIERTO",
        rut: "17.890.123-4",
        telefono: "+56 57 9012345",
        email: "servicios@limpiezadesierto.cl",
        direccion: "Sector Industrial, Galpón 12, Iquique",
        categoria: "Limpieza",
        especialidad: "Limpieza industrial, descontaminación, mantención",
        vigente: true,
        fechaRegistro: "2024-12-15",
        certificaciones: ["SEREMI Salud"],
        empleados: "50-100",
        sitioWeb: "www.limpieza-desierto.cl"
      },
      {
        id: 19,
        nombre: "TECNOLOGÍA E INFORMÁTICA NORTE",
        rut: "96.901.234-5",
        telefono: "+56 57 0123456",
        email: "soporte@tecnorte.cl",
        direccion: "Centro Comercial, Local 45, Iquique",
        categoria: "Informática",
        especialidad: "Sistemas, redes, soporte técnico, desarrollo software",
        vigente: true,
        fechaRegistro: "2024-08-28",
        certificaciones: ["Microsoft Partner"],
        empleados: "10-25",
        sitioWeb: "www.tecno-norte.cl"
      },
      {
        id: 20,
        nombre: "TELECOMUNICACIONES PAMPA SPA",
        rut: "77.012.345-6",
        telefono: "+56 57 1234567",
        email: "proyectos@telecompampa.cl",
        direccion: "Torre Empresarial, Piso 8, Iquique",
        categoria: "Telecomunicaciones",
        especialidad: "Instalaciones telecom, fibra óptica, redes",
        vigente: true,
        fechaRegistro: "2025-02-05",
        certificaciones: ["SUBTEL"],
        empleados: "25-50",
        sitioWeb: "www.telecom-pampa.cl"
      },

      // Servicios Adicionales
      {
        id: 21,
        nombre: "CLIMATIZACIÓN DESIERTO SPA",
        rut: "76.123.456-7",
        telefono: "+56 57 2345678",
        email: "servicios@climadesierto.cl",
        direccion: "Av. Pedro Valdivia 333, Iquique",
        categoria: "Climatización",
        especialidad: "Aire acondicionado, calefacción, ventilación industrial",
        vigente: true,
        fechaRegistro: "2025-01-25",
        certificaciones: ["SERNAC"],
        empleados: "10-25",
        sitioWeb: "www.clima-desierto.cl"
      },
      {
        id: 22,
        nombre: "CARPINTERÍA ARTESANAL TARAPACÁ",
        rut: "14.234.567-8",
        telefono: "+56 57 3456789",
        email: "pedidos@carpintarapa.cl",
        direccion: "Taller Industrial, Sector 5, Iquique",
        categoria: "Carpintería",
        especialidad: "Muebles a medida, estructuras madera, restauración",
        vigente: true,
        fechaRegistro: "2024-11-05",
        certificaciones: [],
        empleados: "5-10",
        sitioWeb: "www.carpinteria-tarapaca.cl"
      },
      {
        id: 23,
        nombre: "VIDRIOS Y CRISTALES NORTE",
        rut: "15.345.678-9",
        telefono: "+56 57 4567890",
        email: "cotizaciones@vidriosnorte.cl",
        direccion: "Av. Circunvalación 888, Iquique",
        categoria: "Vidriería",
        especialidad: "Vidrios templados, espejos, estructuras vidrio",
        vigente: true,
        fechaRegistro: "2025-02-18",
        certificaciones: ["NCh 133"],
        empleados: "10-25",
        sitioWeb: "www.vidrios-norte.cl"
      },
      {
        id: 24,
        nombre: "SOLDADURA ESPECIALIZADA PAMPA",
        rut: "96.456.789-0",
        telefono: "+56 57 5678901",
        email: "trabajos@soldpampa.cl",
        direccion: "Zona Industrial, Nave 15, Iquique",
        categoria: "Soldadura",
        especialidad: "Soldadura industrial, estructural, reparaciones",
        vigente: true,
        fechaRegistro: "2024-10-30",
        certificaciones: ["AWS D1.1"],
        empleados: "25-50",
        sitioWeb: "www.soldadura-pampa.cl"
      },
      {
        id: 25,
        nombre: "JARDINERÍA Y PAISAJISMO OASIS",
        rut: "77.567.890-1",
        telefono: "+56 57 6789012",
        email: "proyectos@jardioasis.cl",
        direccion: "Vivero Principal, Km 5, Iquique",
        categoria: "Paisajismo",
        especialidad: "Diseño jardines, mantención áreas verdes, riego",
        vigente: true,
        fechaRegistro: "2025-03-10",
        certificaciones: ["SAG"],
        empleados: "10-25",
        sitioWeb: "www.oasis-paisajismo.cl"
      }
    ];
    // TOTAL: 25 proveedores de ejemplo para demostración
    // El PDF real "ListadoProveedoresVigentes-04-08-2025.pdf" contiene 9,751 páginas
    // con miles de proveedores organizados en estructura: ID, RUT, Razón Social, Fecha Actualización
  }

  /**
   * Información sobre el PDF real masivo
   */
  getPDFInfo() {
    return {
      filename: this.PDF_SOURCE,
      totalPages: this.PDF_PAGES,
      structure: this.PDF_STRUCTURE,
      currentDataStatus: 'ejemplo_temporal',
      realDataStatus: 'pendiente_procesamiento'
    };
  }

  /**
   * Obtener estadísticas de los proveedores
   */
  getProviderStatistics(providers) {
    const stats = {
      total: providers.length,
      porCategoria: {},
      porTamaño: {},
      conCertificaciones: 0,
      vigentes: 0,
      sitiosWeb: 0
    };

    providers.forEach(provider => {
      // Por categoría
      stats.porCategoria[provider.categoria] = (stats.porCategoria[provider.categoria] || 0) + 1;
      
      // Por tamaño (empleados)
      stats.porTamaño[provider.empleados] = (stats.porTamaño[provider.empleados] || 0) + 1;
      
      // Certificaciones
      if (provider.certificaciones && provider.certificaciones.length > 0) {
        stats.conCertificaciones++;
      }
      
      // Vigentes
      if (provider.vigente) {
        stats.vigentes++;
      }
      
      // Sitios web
      if (provider.sitioWeb) {
        stats.sitiosWeb++;
      }
    });

    return stats;
  }

  /**
   * Buscar proveedores con filtros avanzados
   */
  searchProviders(providers, searchTerm, filters = {}) {
    let filtered = [...providers];

    // Búsqueda por texto
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.nombre.toLowerCase().includes(term) ||
        provider.rut.includes(term) ||
        provider.categoria.toLowerCase().includes(term) ||
        provider.especialidad.toLowerCase().includes(term) ||
        provider.direccion.toLowerCase().includes(term) ||
        provider.email.toLowerCase().includes(term) ||
        provider.telefono.includes(term) ||
        (provider.certificaciones && provider.certificaciones.some(cert => 
          cert.toLowerCase().includes(term)
        ))
      );
    }

    // Filtros adicionales
    if (filters.categoria) {
      filtered = filtered.filter(p => p.categoria === filters.categoria);
    }

    if (filters.tamaño) {
      filtered = filtered.filter(p => p.empleados === filters.tamaño);
    }

    if (filters.conCertificaciones) {
      filtered = filtered.filter(p => p.certificaciones && p.certificaciones.length > 0);
    }

    if (filters.vigente !== undefined) {
      filtered = filtered.filter(p => p.vigente === filters.vigente);
    }

    return filtered;
  }

  /**
   * Exportar proveedores a diferentes formatos
   */
  exportProviders(providers, format = 'csv') {
    switch (format) {
      case 'csv':
        return this.exportToCSV(providers);
      case 'json':
        return this.exportToJSON(providers);
      case 'excel':
        return this.exportToExcel(providers);
      default:
        throw new Error('Formato no soportado');
    }
  }

  /**
   * Exportar a CSV
   */
  exportToCSV(providers) {
    const headers = [
      'Nombre', 'RUT', 'Teléfono', 'Email', 'Dirección', 
      'Categoría', 'Especialidad', 'Empleados', 'Certificaciones',
      'Sitio Web', 'Vigente', 'Fecha Registro'
    ];
    
    const rows = providers.map(p => [
      p.nombre,
      p.rut,
      p.telefono,
      p.email,
      p.direccion,
      p.categoria,
      p.especialidad,
      p.empleados,
      p.certificaciones ? p.certificaciones.join('; ') : '',
      p.sitioWeb || '',
      p.vigente ? 'Sí' : 'No',
      new Date(p.fechaRegistro).toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Exportar a JSON
   */
  exportToJSON(providers) {
    return JSON.stringify({
      fuente: this.PDF_SOURCE,
      fechaExportacion: new Date().toISOString(),
      totalProveedores: providers.length,
      proveedores: providers
    }, null, 2);
  }

  /**
   * Guardar datos en localStorage
   */
  saveToLocalStorage(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        data: data,
        lastUpdate: new Date().toISOString(),
        source: this.PDF_SOURCE
      }));
    } catch (error) {
      console.error('Error guardando datos:', error);
    }
  }

  /**
   * Cargar datos desde localStorage
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error cargando datos:', error);
      return null;
    }
  }

  /**
   * Limpiar datos guardados
   */
  clearLocalStorage() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default new ProvidersListService();
