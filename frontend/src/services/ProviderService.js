/**
 * Provider Service
 * Maneja operaciones CRUD de proveedores con MongoDB Atlas
 * 
 * CONFIGURACIÓN ACTUAL:
 * - Base de datos: MongoDB Atlas (colección 'providers')
 * - Modelo: Provider.js en backend
 * - Fallback: Datos CSV locales + localStorage
 * 
 * PARA CAMBIAR BASE DE DATOS:
 * 1. Modificar endpoints si cambian las rutas del backend
 * 2. Actualizar handleOfflineMode() si cambias el sistema de fallback
 * 3. Cambiar processCSVProviders() si modificas el formato de CSV
 * 4. Ajustar cacheProviders() si cambias el sistema de cache local
 */

import ApiService from './ApiService';
import { sampleCSVProviders } from '../data/sampleCSVData';

class ProviderService {
  constructor() {
    this.apiService = ApiService;
    
    // CONFIGURACIÓN DE ENDPOINTS DE PROVEEDORES
    // Si el backend cambia estas rutas, modificar aquí
    this.endpoints = {
      getAll: '/providers',
      getById: '/providers',
      create: '/providers',
      update: '/providers',
      delete: '/providers',
      import: '/providers/import',
      export: '/providers/export',
      search: '/providers/search',
      // Endpoints específicos para CSV
      csvProviders: '/csv-providers',
      csvStats: '/csv-providers/stats'
    };

    // Cache local para modo offline
    this.cache = {
      providers: null,
      lastUpdate: null,
      csvData: null
    };

    console.log('🏢 ProviderService inicializado');
  }

  /**
   * Obtener todos los proveedores desde la base de datos
   * FALLBACK: Datos locales si no hay conexión
   */
  async getAllProviders() {
    try {
      console.log('📋 Obteniendo proveedores desde BD...');
      
      const response = await this.apiService.get(this.endpoints.getAll);
      
      if (response.success && response.data) {
        // Cachear datos para uso offline
        this.cacheProviders(response.data);
        
        console.log(`✅ ${response.data.length} proveedores obtenidos desde BD`);
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo proveedores de BD, usando modo offline:', error.message);
      return this.handleOfflineMode();
    }
  }

  /**
   * Obtener proveedores CSV desde la base de datos
   * Estos son los proveedores importados desde los archivos CSV de cotizaciones
   */
  async getCSVProviders() {
    try {
      console.log('📊 Obteniendo proveedores CSV desde BD...');
      
      const response = await this.apiService.get(this.endpoints.csvProviders);
      
      if (response.success && response.data) {
        // Cachear datos CSV
        this.cache.csvData = response.data;
        
        console.log(`✅ ${response.data.providers?.length || 0} proveedores CSV desde BD`);
        return {
          success: true,
          ...response.data,
          source: 'database'
        };
      } else {
        throw new Error('No se pudieron obtener proveedores CSV');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo CSV de BD, usando datos de ejemplo:', error.message);
      return this.getCSVProvidersOffline();
    }
  }

  /**
   * Crear nuevo proveedor en la base de datos
   */
  async createProvider(providerData) {
    try {
      console.log('➕ Creando proveedor en BD:', providerData.name);
      
      const response = await this.apiService.post(this.endpoints.create, providerData);
      
      if (response.success && response.data) {
        // Invalidar cache
        this.cache.providers = null;
        
        console.log('✅ Proveedor creado en BD:', response.data.name);
        return {
          success: true,
          data: response.data,
          message: 'Proveedor creado exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error creando proveedor');
      }
      
    } catch (error) {
      console.error('❌ Error creando proveedor:', error);
      
      // FALLBACK: Guardar en localStorage si no hay conexión
      return this.createProviderOffline(providerData);
    }
  }

  /**
   * Actualizar proveedor existente
   */
  async updateProvider(providerId, updateData) {
    try {
      console.log('✏️ Actualizando proveedor en BD:', providerId);
      
      const response = await this.apiService.put(`${this.endpoints.update}/${providerId}`, updateData);
      
      if (response.success && response.data) {
        // Invalidar cache
        this.cache.providers = null;
        
        console.log('✅ Proveedor actualizado en BD');
        return {
          success: true,
          data: response.data,
          message: 'Proveedor actualizado exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error actualizando proveedor');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando proveedor:', error);
      throw error;
    }
  }

  /**
   * Eliminar proveedor
   */
  async deleteProvider(providerId) {
    try {
      console.log('🗑️ Eliminando proveedor de BD:', providerId);
      
      const response = await this.apiService.delete(`${this.endpoints.delete}/${providerId}`);
      
      if (response.success) {
        // Invalidar cache
        this.cache.providers = null;
        
        console.log('✅ Proveedor eliminado de BD');
        return {
          success: true,
          message: 'Proveedor eliminado exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error eliminando proveedor');
      }
      
    } catch (error) {
      console.error('❌ Error eliminando proveedor:', error);
      throw error;
    }
  }

  /**
   * Importar proveedores masivamente a la base de datos
   */
  async importProviders(providersData, importType = 'csv') {
    try {
      console.log(`📥 Importando ${providersData.length} proveedores a BD...`);
      
      const response = await this.apiService.post(this.endpoints.import, {
        providers: providersData,
        importType: importType,
        importDate: new Date().toISOString()
      });
      
      if (response.success) {
        // Invalidar cache
        this.cache.providers = null;
        this.cache.csvData = null;
        
        console.log(`✅ ${response.imported || providersData.length} proveedores importados a BD`);
        return {
          success: true,
          imported: response.imported || providersData.length,
          message: 'Proveedores importados exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error en importación');
      }
      
    } catch (error) {
      console.warn('⚠️ Error importando a BD, guardando en localStorage:', error.message);
      return this.importProvidersOffline(providersData, importType);
    }
  }

  /**
   * Buscar proveedores
   */
  async searchProviders(query, filters = {}) {
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
      return this.searchProvidersOffline(query, filters);
    }
  }

  // ===========================================
  // MÉTODOS DE FALLBACK OFFLINE
  // ===========================================

  /**
   * FALLBACK: Manejar modo offline cuando no hay conexión a BD
   */
  handleOfflineMode() {
    console.log('📱 Activando modo offline para proveedores');
    
    // Intentar usar cache primero
    if (this.cache.providers) {
      return {
        success: true,
        data: this.cache.providers,
        source: 'cache'
      };
    }
    
    // Usar localStorage como último recurso
    const localProviders = this.getLocalStorageProviders();
    return {
      success: true,
      data: localProviders,
      source: 'localStorage'
    };
  }

  /**
   * FALLBACK: Obtener proveedores CSV en modo offline
   */
  getCSVProvidersOffline() {
    console.log('📊 Usando datos CSV de ejemplo (modo offline)');
    
    return {
      success: true,
      providers: sampleCSVProviders,
      total: sampleCSVProviders.length,
      source: 'sample',
      stats: {
        total: sampleCSVProviders.length,
        withEmail: sampleCSVProviders.filter(p => p.email).length,
        withPhone: sampleCSVProviders.filter(p => p.phone).length,
        withRUT: sampleCSVProviders.filter(p => p.rut).length
      }
    };
  }

  /**
   * FALLBACK: Crear proveedor en localStorage
   */
  createProviderOffline(providerData) {
    const providers = this.getLocalStorageProviders();
    const newProvider = {
      ...providerData,
      id: `offline_${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: 'offline'
    };
    
    providers.push(newProvider);
    this.saveLocalStorageProviders(providers);
    
    return {
      success: true,
      data: newProvider,
      message: 'Proveedor guardado localmente (será sincronizado cuando haya conexión)'
    };
  }

  /**
   * FALLBACK: Importar proveedores en localStorage
   */
  importProvidersOffline(providersData, importType) {
    const existingProviders = this.getLocalStorageProviders();
    const importedProviders = providersData.map(p => ({
      ...p,
      id: p.id || `offline_${Date.now()}_${Math.random()}`,
      importType,
      importDate: new Date().toISOString(),
      source: 'offline'
    }));
    
    const allProviders = [...existingProviders, ...importedProviders];
    this.saveLocalStorageProviders(allProviders);
    
    return {
      success: true,
      imported: importedProviders.length,
      message: `${importedProviders.length} proveedores guardados localmente`
    };
  }

  /**
   * FALLBACK: Buscar en datos locales
   */
  searchProvidersOffline(query, filters) {
    const providers = this.getLocalStorageProviders();
    const results = providers.filter(provider => {
      const matchesQuery = !query || 
        provider.name?.toLowerCase().includes(query.toLowerCase()) ||
        provider.email?.toLowerCase().includes(query.toLowerCase()) ||
        provider.phone?.includes(query);
      
      // Aplicar filtros adicionales aquí si es necesario
      
      return matchesQuery;
    });
    
    return {
      success: true,
      data: results,
      total: results.length,
      source: 'localStorage'
    };
  }

  // ===========================================
  // UTILIDADES DE CACHE Y ALMACENAMIENTO LOCAL
  // ===========================================

  /**
   * Cachear proveedores para uso offline
   */
  cacheProviders(providers) {
    this.cache.providers = providers;
    this.cache.lastUpdate = new Date().toISOString();
  }

  /**
   * Obtener proveedores de localStorage
   */
  getLocalStorageProviders() {
    try {
      const stored = localStorage.getItem('importedProviders');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error leyendo localStorage:', error);
      return [];
    }
  }

  /**
   * Guardar proveedores en localStorage
   */
  saveLocalStorageProviders(providers) {
    try {
      localStorage.setItem('importedProviders', JSON.stringify(providers));
      localStorage.setItem('providersImportDate', new Date().toISOString());
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
    }
  }

  /**
   * Limpiar cache y datos locales
   */
  clearLocalData() {
    this.cache = { providers: null, lastUpdate: null, csvData: null };
    localStorage.removeItem('importedProviders');
    localStorage.removeItem('providersImportDate');
  }

  /**
   * Verificar estado de conexión y datos
   */
  getDataStatus() {
    return {
      hasCache: !!this.cache.providers,
      hasLocalStorage: this.getLocalStorageProviders().length > 0,
      lastCacheUpdate: this.cache.lastUpdate,
      cacheSize: this.cache.providers?.length || 0,
      localStorageSize: this.getLocalStorageProviders().length
    };
  }
}

// Exportar instancia singleton
export default new ProviderService();
