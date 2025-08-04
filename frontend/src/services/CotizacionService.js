/**
 * Cotización Service
 * Maneja operaciones CRUD de cotizaciones con MongoDB Atlas
 * 
 * CONFIGURACIÓN ACTUAL:
 * - Base de datos: MongoDB Atlas (colección 'cotizaciones')
 * - Modelo: Cotizacion.js en backend
 * - Fallback: Datos localStorage + datos de ejemplo
 * 
 * PARA CAMBIAR BASE DE DATOS:
 * 1. Modificar endpoints si cambian las rutas del backend
 * 2. Actualizar handleOfflineMode() si cambias el sistema de fallback
 * 3. Cambiar sampleCotizaciones si necesitas datos demo diferentes
 * 4. Ajustar cacheCotizaciones() si cambias el sistema de cache local
 * 5. Modificar processCSVData() si cambia el formato de CSV de entrada
 */

import ApiService from './ApiService';

class CotizacionService {
  constructor() {
    this.apiService = ApiService;
    
    // CONFIGURACIÓN DE ENDPOINTS DE COTIZACIONES
    // Si el backend cambia estas rutas, modificar aquí
    this.endpoints = {
      getAll: '/cotizaciones',
      getById: '/cotizaciones',
      create: '/cotizaciones',
      update: '/cotizaciones',
      delete: '/cotizaciones',
      search: '/cotizaciones/search',
      getByProject: '/cotizaciones/project',
      getByProvider: '/cotizaciones/provider',
      updateStatus: '/cotizaciones/status',
      compare: '/cotizaciones/compare',
      importCSV: '/cotizaciones/import-csv',
      getStats: '/cotizaciones/stats'
    };

    // Cache local para modo offline
    this.cache = {
      cotizaciones: null,
      lastUpdate: null,
      projectCotizaciones: new Map(),
      providerCotizaciones: new Map()
    };

    // Datos de ejemplo para modo offline
    this.sampleCotizaciones = [
      {
        id: 'demo_cotiz_1',
        projectId: 'demo_1',
        providerId: 'demo_prov_1',
        providerName: 'Constructora Demo S.A.',
        title: 'Cotización Materiales Edificio A - Fase 1',
        description: 'Cotización para materiales de construcción primera fase',
        items: [
          {
            id: 'item_1',
            description: 'Cemento Portland 42.5 kg',
            quantity: 100,
            unit: 'sacos',
            unitPrice: 8500,
            totalPrice: 850000,
            category: 'Materiales Base'
          },
          {
            id: 'item_2',
            description: 'Fierro corrugado 12mm x 6m',
            quantity: 50,
            unit: 'barras',
            unitPrice: 12000,
            totalPrice: 600000,
            category: 'Estructural'
          },
          {
            id: 'item_3',
            description: 'Ladrillo fiscal',
            quantity: 5000,
            unit: 'unidades',
            unitPrice: 250,
            totalPrice: 1250000,
            category: 'Mampostería'
          }
        ],
        subtotal: 2700000,
        tax: 513000,
        total: 3213000,
        currency: 'CLP',
        status: 'pending',
        priority: 'high',
        validUntil: '2024-02-15',
        paymentTerms: '30 días',
        deliveryTime: '15 días',
        notes: 'Precios incluyen despacho en región metropolitana',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        source: 'demo'
      },
      {
        id: 'demo_cotiz_2',
        projectId: 'demo_2',
        providerId: 'demo_prov_2',
        providerName: 'Acabados Premium Ltda.',
        title: 'Cotización Acabados Oficinas',
        description: 'Cotización para acabados y terminaciones oficinas corporativas',
        items: [
          {
            id: 'item_4',
            description: 'Pintura látex interior premium',
            quantity: 20,
            unit: 'galones',
            unitPrice: 25000,
            totalPrice: 500000,
            category: 'Pinturas'
          },
          {
            id: 'item_5',
            description: 'Piso laminado AC4 8mm',
            quantity: 200,
            unit: 'm²',
            unitPrice: 15000,
            totalPrice: 3000000,
            category: 'Pisos'
          },
          {
            id: 'item_6',
            description: 'Luminaria LED empotrable',
            quantity: 30,
            unit: 'unidades',
            unitPrice: 45000,
            totalPrice: 1350000,
            category: 'Iluminación'
          }
        ],
        subtotal: 4850000,
        tax: 921500,
        total: 5771500,
        currency: 'CLP',
        status: 'approved',
        priority: 'medium',
        validUntil: '2024-03-15',
        paymentTerms: '45 días',
        deliveryTime: '20 días',
        notes: 'Instalación incluida. Garantía 2 años.',
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-05').toISOString(),
        createdBy: 'supervisor1',
        approvedAt: new Date('2024-02-05').toISOString(),
        approvedBy: 'admin',
        source: 'demo'
      },
      {
        id: 'demo_cotiz_3',
        projectId: 'demo_3',
        providerId: 'demo_prov_3',
        providerName: 'Instalaciones Técnicas SpA',
        title: 'Cotización Sistema Eléctrico Centro Comercial',
        description: 'Sistema eléctrico completo para centro comercial',
        items: [
          {
            id: 'item_7',
            description: 'Tablero eléctrico principal 400A',
            quantity: 1,
            unit: 'unidad',
            unitPrice: 850000,
            totalPrice: 850000,
            category: 'Eléctrico'
          },
          {
            id: 'item_8',
            description: 'Cable THHN 12 AWG',
            quantity: 2000,
            unit: 'metros',
            unitPrice: 1200,
            totalPrice: 2400000,
            category: 'Cables'
          },
          {
            id: 'item_9',
            description: 'Luminaria comercial LED 150W',
            quantity: 100,
            unit: 'unidades',
            unitPrice: 85000,
            totalPrice: 8500000,
            category: 'Iluminación'
          }
        ],
        subtotal: 11750000,
        tax: 2232500,
        total: 13982500,
        currency: 'CLP',
        status: 'completed',
        priority: 'high',
        validUntil: '2023-12-31',
        paymentTerms: '60 días',
        deliveryTime: '45 días',
        notes: 'Proyecto completado satisfactoriamente',
        createdAt: new Date('2023-11-01').toISOString(),
        updatedAt: new Date('2024-01-31').toISOString(),
        createdBy: 'admin',
        approvedAt: new Date('2023-11-15').toISOString(),
        approvedBy: 'admin',
        completedAt: new Date('2024-01-31').toISOString(),
        source: 'demo'
      }
    ];

    console.log('💰 CotizacionService inicializado');
  }

  /**
   * Obtener todas las cotizaciones desde la base de datos
   * FALLBACK: Datos locales si no hay conexión
   */
  async getAllCotizaciones() {
    try {
      console.log('💰 Obteniendo cotizaciones desde BD...');
      
      const response = await this.apiService.get(this.endpoints.getAll);
      
      if (response.success && response.data) {
        // Cachear datos para uso offline
        this.cacheCotizaciones(response.data);
        
        console.log(`✅ ${response.data.length} cotizaciones obtenidas desde BD`);
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo cotizaciones de BD, usando modo offline:', error.message);
      return this.handleOfflineMode();
    }
  }

  /**
   * Obtener cotización específica por ID
   */
  async getCotizacionById(cotizacionId) {
    try {
      console.log('💰 Obteniendo cotización por ID:', cotizacionId);
      
      const response = await this.apiService.get(`${this.endpoints.getById}/${cotizacionId}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Cotización no encontrada');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo cotización de BD, buscando en cache:', error.message);
      return this.getCotizacionByIdOffline(cotizacionId);
    }
  }

  /**
   * Crear nueva cotización en la base de datos
   */
  async createCotizacion(cotizacionData) {
    try {
      console.log('➕ Creando cotización en BD:', cotizacionData.title);
      
      // Preparar datos de la cotización
      const newCotizacionData = {
        ...cotizacionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: cotizacionData.status || 'pending'
      };
      
      // Calcular totales si no están definidos
      if (newCotizacionData.items && !newCotizacionData.subtotal) {
        const subtotal = newCotizacionData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const tax = subtotal * 0.19; // IVA 19%
        newCotizacionData.subtotal = subtotal;
        newCotizacionData.tax = tax;
        newCotizacionData.total = subtotal + tax;
      }
      
      const response = await this.apiService.post(this.endpoints.create, newCotizacionData);
      
      if (response.success && response.data) {
        // Invalidar cache
        this.cache.cotizaciones = null;
        
        console.log('✅ Cotización creada en BD:', response.data.title);
        return {
          success: true,
          data: response.data,
          message: 'Cotización creada exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error creando cotización');
      }
      
    } catch (error) {
      console.error('❌ Error creando cotización:', error);
      
      // FALLBACK: Guardar en localStorage si no hay conexión
      return this.createCotizacionOffline(cotizacionData);
    }
  }

  /**
   * Actualizar cotización existente
   */
  async updateCotizacion(cotizacionId, updateData) {
    try {
      console.log('✏️ Actualizando cotización en BD:', cotizacionId);
      
      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Recalcular totales si se actualizaron items
      if (updatePayload.items) {
        const subtotal = updatePayload.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const tax = subtotal * 0.19;
        updatePayload.subtotal = subtotal;
        updatePayload.tax = tax;
        updatePayload.total = subtotal + tax;
      }
      
      const response = await this.apiService.put(`${this.endpoints.update}/${cotizacionId}`, updatePayload);
      
      if (response.success && response.data) {
        // Invalidar cache
        this.cache.cotizaciones = null;
        
        console.log('✅ Cotización actualizada en BD');
        return {
          success: true,
          data: response.data,
          message: 'Cotización actualizada exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error actualizando cotización');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando cotización:', error);
      
      // FALLBACK: Actualizar en localStorage
      return this.updateCotizacionOffline(cotizacionId, updateData);
    }
  }

  /**
   * Eliminar cotización
   */
  async deleteCotizacion(cotizacionId) {
    try {
      console.log('🗑️ Eliminando cotización de BD:', cotizacionId);
      
      const response = await this.apiService.delete(`${this.endpoints.delete}/${cotizacionId}`);
      
      if (response.success) {
        // Invalidar cache
        this.cache.cotizaciones = null;
        
        console.log('✅ Cotización eliminada de BD');
        return {
          success: true,
          message: 'Cotización eliminada exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error eliminando cotización');
      }
      
    } catch (error) {
      console.error('❌ Error eliminando cotización:', error);
      throw error;
    }
  }

  /**
   * Obtener cotizaciones por proyecto
   */
  async getCotizacionesByProject(projectId) {
    try {
      const response = await this.apiService.get(`${this.endpoints.getByProject}/${projectId}`);
      
      if (response.success && response.data) {
        // Cachear cotizaciones del proyecto
        this.cache.projectCotizaciones.set(projectId, response.data);
        
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Error obteniendo cotizaciones del proyecto');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo cotizaciones de proyecto, usando datos locales');
      return this.getCotizacionesByProjectOffline(projectId);
    }
  }

  /**
   * Obtener cotizaciones por proveedor
   */
  async getCotizacionesByProvider(providerId) {
    try {
      const response = await this.apiService.get(`${this.endpoints.getByProvider}/${providerId}`);
      
      if (response.success && response.data) {
        // Cachear cotizaciones del proveedor
        this.cache.providerCotizaciones.set(providerId, response.data);
        
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Error obteniendo cotizaciones del proveedor');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo cotizaciones de proveedor, usando datos locales');
      return this.getCotizacionesByProviderOffline(providerId);
    }
  }

  /**
   * Actualizar estado de cotización
   */
  async updateCotizacionStatus(cotizacionId, status, userId) {
    try {
      const response = await this.apiService.put(`${this.endpoints.updateStatus}/${cotizacionId}`, {
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'approved' && { approvedAt: new Date().toISOString(), approvedBy: userId }),
        ...(status === 'completed' && { completedAt: new Date().toISOString() })
      });
      
      if (response.success && response.data) {
        this.cache.cotizaciones = null; // Invalidar cache
        return {
          success: true,
          data: response.data,
          message: `Estado actualizado a: ${status}`
        };
      } else {
        throw new Error('Error actualizando estado');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando estado de cotización:', error);
      throw error;
    }
  }

  /**
   * Comparar cotizaciones
   */
  async compareCotizaciones(cotizacionIds) {
    try {
      const response = await this.apiService.post(this.endpoints.compare, {
        cotizacionIds
      });
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          comparison: response.comparison
        };
      } else {
        throw new Error('Error comparando cotizaciones');
      }
      
    } catch (error) {
      console.warn('⚠️ Error comparando en BD, comparando localmente');
      return this.compareCotizacionesOffline(cotizacionIds);
    }
  }

  /**
   * Importar cotizaciones desde CSV
   */
  async importCSV(csvData, projectId) {
    try {
      const response = await this.apiService.post(this.endpoints.importCSV, {
        csvData,
        projectId,
        importDate: new Date().toISOString()
      });
      
      if (response.success) {
        this.cache.cotizaciones = null; // Invalidar cache
        return {
          success: true,
          imported: response.imported || 0,
          message: `${response.imported || 0} cotizaciones importadas exitosamente`
        };
      } else {
        throw new Error('Error importando CSV');
      }
      
    } catch (error) {
      console.warn('⚠️ Error importando CSV a BD, guardando localmente');
      return this.importCSVOffline(csvData, projectId);
    }
  }

  /**
   * Obtener estadísticas de cotizaciones
   */
  async getCotizacionStats() {
    try {
      const response = await this.apiService.get(this.endpoints.getStats);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Error obteniendo estadísticas');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo estadísticas, generando desde datos locales');
      return this.getCotizacionStatsOffline();
    }
  }

  /**
   * Buscar cotizaciones
   */
  async searchCotizaciones(query, filters = {}) {
    try {
      const response = await this.apiService.post(this.endpoints.search, {
        query,
        filters
      });
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          total: response.total || response.data.length
        };
      } else {
        throw new Error('Error en búsqueda');
      }
      
    } catch (error) {
      console.warn('⚠️ Error en búsqueda BD, buscando en cache local');
      return this.searchCotizacionesOffline(query, filters);
    }
  }

  // ===========================================
  // MÉTODOS DE FALLBACK OFFLINE
  // ===========================================

  /**
   * FALLBACK: Manejar modo offline cuando no hay conexión a BD
   */
  handleOfflineMode() {
    console.log('📱 Activando modo offline para cotizaciones');
    
    // Intentar usar cache primero
    if (this.cache.cotizaciones) {
      return {
        success: true,
        data: this.cache.cotizaciones,
        source: 'cache'
      };
    }
    
    // Usar localStorage como segundo recurso
    const localCotizaciones = this.getLocalStorageCotizaciones();
    if (localCotizaciones.length > 0) {
      return {
        success: true,
        data: localCotizaciones,
        source: 'localStorage'
      };
    }
    
    // Usar datos de ejemplo como último recurso
    return {
      success: true,
      data: this.sampleCotizaciones,
      source: 'sample'
    };
  }

  /**
   * FALLBACK: Obtener cotización por ID offline
   */
  getCotizacionByIdOffline(cotizacionId) {
    const allCotizaciones = this.getAllCotizacionesOffline();
    const cotizacion = allCotizaciones.find(c => c.id === cotizacionId);
    
    if (cotizacion) {
      return { success: true, data: cotizacion, source: 'offline' };
    }
    
    return { success: false, error: 'Cotización no encontrada' };
  }

  /**
   * FALLBACK: Crear cotización offline
   */
  createCotizacionOffline(cotizacionData) {
    const cotizaciones = this.getLocalStorageCotizaciones();
    const newCotizacion = {
      ...cotizacionData,
      id: `offline_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'offline'
    };
    
    // Calcular totales
    if (newCotizacion.items && !newCotizacion.subtotal) {
      const subtotal = newCotizacion.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      const tax = subtotal * 0.19;
      newCotizacion.subtotal = subtotal;
      newCotizacion.tax = tax;
      newCotizacion.total = subtotal + tax;
    }
    
    cotizaciones.push(newCotizacion);
    this.saveLocalStorageCotizaciones(cotizaciones);
    
    return {
      success: true,
      data: newCotizacion,
      message: 'Cotización guardada localmente (será sincronizada cuando haya conexión)'
    };
  }

  /**
   * FALLBACK: Actualizar cotización offline
   */
  updateCotizacionOffline(cotizacionId, updateData) {
    const cotizaciones = this.getLocalStorageCotizaciones();
    const index = cotizaciones.findIndex(c => c.id === cotizacionId);
    
    if (index !== -1) {
      cotizaciones[index] = {
        ...cotizaciones[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Recalcular totales si se actualizaron items
      if (updateData.items) {
        const subtotal = updateData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const tax = subtotal * 0.19;
        cotizaciones[index].subtotal = subtotal;
        cotizaciones[index].tax = tax;
        cotizaciones[index].total = subtotal + tax;
      }
      
      this.saveLocalStorageCotizaciones(cotizaciones);
      
      return {
        success: true,
        data: cotizaciones[index],
        message: 'Cotización actualizada localmente'
      };
    }
    
    return { success: false, error: 'Cotización no encontrada' };
  }

  /**
   * Obtener todas las cotizaciones offline (combinando fuentes)
   */
  getAllCotizacionesOffline() {
    if (this.cache.cotizaciones) return this.cache.cotizaciones;
    
    const localCotizaciones = this.getLocalStorageCotizaciones();
    if (localCotizaciones.length > 0) return localCotizaciones;
    
    return this.sampleCotizaciones;
  }

  /**
   * FALLBACK: Obtener cotizaciones por proyecto offline
   */
  getCotizacionesByProjectOffline(projectId) {
    const allCotizaciones = this.getAllCotizacionesOffline();
    const projectCotizaciones = allCotizaciones.filter(c => c.projectId === projectId);
    
    return {
      success: true,
      data: projectCotizaciones,
      source: 'offline'
    };
  }

  /**
   * FALLBACK: Obtener cotizaciones por proveedor offline
   */
  getCotizacionesByProviderOffline(providerId) {
    const allCotizaciones = this.getAllCotizacionesOffline();
    const providerCotizaciones = allCotizaciones.filter(c => c.providerId === providerId);
    
    return {
      success: true,
      data: providerCotizaciones,
      source: 'offline'
    };
  }

  /**
   * FALLBACK: Comparar cotizaciones offline
   */
  compareCotizacionesOffline(cotizacionIds) {
    const allCotizaciones = this.getAllCotizacionesOffline();
    const cotizacionesToCompare = allCotizaciones.filter(c => cotizacionIds.includes(c.id));
    
    if (cotizacionesToCompare.length < 2) {
      return { success: false, error: 'Se necesitan al menos 2 cotizaciones para comparar' };
    }
    
    // Comparación básica
    const comparison = {
      cotizaciones: cotizacionesToCompare,
      cheapest: cotizacionesToCompare.reduce((min, c) => c.total < min.total ? c : min),
      mostExpensive: cotizacionesToCompare.reduce((max, c) => c.total > max.total ? c : max),
      averageTotal: cotizacionesToCompare.reduce((sum, c) => sum + c.total, 0) / cotizacionesToCompare.length
    };
    
    return {
      success: true,
      data: cotizacionesToCompare,
      comparison,
      source: 'offline'
    };
  }

  /**
   * FALLBACK: Importar CSV offline
   */
  importCSVOffline(csvData, projectId) {
    // Simulación de importación CSV - aquí procesarías los datos CSV
    const processedCotizaciones = this.processCSVData(csvData, projectId);
    
    const existingCotizaciones = this.getLocalStorageCotizaciones();
    const allCotizaciones = [...existingCotizaciones, ...processedCotizaciones];
    
    this.saveLocalStorageCotizaciones(allCotizaciones);
    
    return {
      success: true,
      imported: processedCotizaciones.length,
      message: `${processedCotizaciones.length} cotizaciones importadas localmente`
    };
  }

  /**
   * Procesar datos CSV para cotizaciones
   */
  processCSVData(csvData, projectId) {
    // Esta función procesaría los datos CSV reales
    // Por ahora devuelve datos de ejemplo
    return [
      {
        id: `csv_${Date.now()}`,
        projectId: projectId,
        title: 'Cotización importada desde CSV',
        description: 'Cotización procesada desde archivo CSV',
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        currency: 'CLP',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'csv_import'
      }
    ];
  }

  /**
   * FALLBACK: Generar estadísticas offline
   */
  getCotizacionStatsOffline() {
    const cotizaciones = this.getAllCotizacionesOffline();
    
    const stats = {
      total: cotizaciones.length,
      pending: cotizaciones.filter(c => c.status === 'pending').length,
      approved: cotizaciones.filter(c => c.status === 'approved').length,
      rejected: cotizaciones.filter(c => c.status === 'rejected').length,
      completed: cotizaciones.filter(c => c.status === 'completed').length,
      totalValue: cotizaciones.reduce((sum, c) => sum + (c.total || 0), 0),
      averageValue: cotizaciones.length > 0 
        ? cotizaciones.reduce((sum, c) => sum + (c.total || 0), 0) / cotizaciones.length 
        : 0,
      byMonth: this.groupCotizacionesByMonth(cotizaciones)
    };
    
    return {
      success: true,
      data: stats,
      source: 'offline'
    };
  }

  /**
   * Agrupar cotizaciones por mes
   */
  groupCotizacionesByMonth(cotizaciones) {
    const groups = {};
    
    cotizaciones.forEach(cotizacion => {
      const date = new Date(cotizacion.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[key]) {
        groups[key] = { count: 0, total: 0 };
      }
      
      groups[key].count++;
      groups[key].total += cotizacion.total || 0;
    });
    
    return groups;
  }

  /**
   * FALLBACK: Buscar cotizaciones offline
   */
  searchCotizacionesOffline(query, filters) {
    const cotizaciones = this.getAllCotizacionesOffline();
    const results = cotizaciones.filter(cotizacion => {
      const matchesQuery = !query || 
        cotizacion.title?.toLowerCase().includes(query.toLowerCase()) ||
        cotizacion.description?.toLowerCase().includes(query.toLowerCase()) ||
        cotizacion.providerName?.toLowerCase().includes(query.toLowerCase());
      
      // Aplicar filtros
      if (filters.status && cotizacion.status !== filters.status) return false;
      if (filters.projectId && cotizacion.projectId !== filters.projectId) return false;
      if (filters.providerId && cotizacion.providerId !== filters.providerId) return false;
      if (filters.priority && cotizacion.priority !== filters.priority) return false;
      
      return matchesQuery;
    });
    
    return {
      success: true,
      data: results,
      total: results.length,
      source: 'offline'
    };
  }

  // ===========================================
  // UTILIDADES DE CACHE Y ALMACENAMIENTO LOCAL
  // ===========================================

  /**
   * Cachear cotizaciones para uso offline
   */
  cacheCotizaciones(cotizaciones) {
    this.cache.cotizaciones = cotizaciones;
    this.cache.lastUpdate = new Date().toISOString();
  }

  /**
   * Obtener cotizaciones de localStorage
   */
  getLocalStorageCotizaciones() {
    try {
      const stored = localStorage.getItem('cotizaciones');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error leyendo cotizaciones de localStorage:', error);
      return [];
    }
  }

  /**
   * Guardar cotizaciones en localStorage
   */
  saveLocalStorageCotizaciones(cotizaciones) {
    try {
      localStorage.setItem('cotizaciones', JSON.stringify(cotizaciones));
      localStorage.setItem('cotizacionesLastUpdate', new Date().toISOString());
    } catch (error) {
      console.error('❌ Error guardando cotizaciones en localStorage:', error);
    }
  }

  /**
   * Limpiar cache y datos locales
   */
  clearLocalData() {
    this.cache = { 
      cotizaciones: null, 
      lastUpdate: null, 
      projectCotizaciones: new Map(),
      providerCotizaciones: new Map()
    };
    localStorage.removeItem('cotizaciones');
    localStorage.removeItem('cotizacionesLastUpdate');
  }

  /**
   * Verificar estado de conexión y datos
   */
  getDataStatus() {
    return {
      hasCache: !!this.cache.cotizaciones,
      hasLocalStorage: this.getLocalStorageCotizaciones().length > 0,
      lastCacheUpdate: this.cache.lastUpdate,
      cacheSize: this.cache.cotizaciones?.length || 0,
      localStorageSize: this.getLocalStorageCotizaciones().length,
      sampleDataSize: this.sampleCotizaciones.length,
      projectCacheSize: this.cache.projectCotizaciones.size,
      providerCacheSize: this.cache.providerCotizaciones.size
    };
  }
}

// Exportar instancia singleton
export default new CotizacionService();
