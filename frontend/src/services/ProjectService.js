/**
 * Project Service
 * Maneja operaciones CRUD de proyectos con MongoDB Atlas
 * 
 * CONFIGURACIÓN ACTUAL:
 * - Base de datos: MongoDB Atlas (colección 'projects')
 * - Modelo: Project.js en backend
 * - Fallback: Datos localStorage
 * 
 * PARA CAMBIAR BASE DE DATOS:
 * 1. Modificar endpoints si cambian las rutas del backend
 * 2. Actualizar handleOfflineMode() si cambias el sistema de fallback
 * 3. Cambiar sampleProjects si necesitas datos demo diferentes
 * 4. Ajustar cacheProjects() si cambias el sistema de cache local
 */

import ApiService from './ApiService';

class ProjectService {
  constructor() {
    this.apiService = ApiService;
    
    // CONFIGURACIÓN DE ENDPOINTS DE PROYECTOS
    // Si el backend cambia estas rutas, modificar aquí
    this.endpoints = {
      getAll: '/projects',
      getById: '/projects',
      create: '/projects',
      update: '/projects',
      delete: '/projects',
      search: '/projects/search',
      getUserProjects: '/projects/user',
      getProjectStats: '/projects/stats',
      updateStatus: '/projects/status'
    };

    // Cache local para modo offline
    this.cache = {
      projects: null,
      lastUpdate: null,
      userProjects: null
    };

    // Datos de ejemplo para modo offline
    this.sampleProjects = [
      {
        id: 'demo_1',
        name: 'Proyecto Demo - Construcción Edificio A',
        description: 'Proyecto de demostración para construcción de edificio residencial',
        client: 'Cliente Demo',
        status: 'active',
        priority: 'high',
        budget: 150000000,
        spent: 45000000,
        progress: 30,
        startDate: '2024-01-15',
        endDate: '2024-12-15',
        manager: 'admin',
        team: ['admin', 'supervisor1'],
        tags: ['construcción', 'residencial', 'demo'],
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'demo'
      },
      {
        id: 'demo_2',
        name: 'Proyecto Demo - Renovación Oficinas',
        description: 'Renovación completa de oficinas corporativas',
        client: 'Empresa Demo',
        status: 'planning',
        priority: 'medium',
        budget: 80000000,
        spent: 12000000,
        progress: 15,
        startDate: '2024-03-01',
        endDate: '2024-08-30',
        manager: 'supervisor1',
        team: ['supervisor1', 'empleado1'],
        tags: ['renovación', 'oficinas', 'demo'],
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'demo'
      },
      {
        id: 'demo_3',
        name: 'Proyecto Demo - Centro Comercial',
        description: 'Construcción de nuevo centro comercial',
        client: 'Inversionista Demo',
        status: 'completed',
        priority: 'high',
        budget: 500000000,
        spent: 480000000,
        progress: 100,
        startDate: '2023-06-01',
        endDate: '2024-01-31',
        manager: 'admin',
        team: ['admin', 'supervisor1', 'empleado1'],
        tags: ['construcción', 'comercial', 'completado'],
        createdAt: new Date('2023-05-01').toISOString(),
        updatedAt: new Date('2024-01-31').toISOString(),
        source: 'demo'
      }
    ];

    console.log('📋 ProjectService inicializado');
  }

  /**
   * Obtener todos los proyectos desde la base de datos
   * FALLBACK: Datos locales si no hay conexión
   */
  async getAllProjects() {
    try {
      console.log('📋 Obteniendo proyectos desde BD...');
      
      const response = await this.apiService.get(this.endpoints.getAll);
      
      if (response.success && response.data) {
        // Cachear datos para uso offline
        this.cacheProjects(response.data);
        
        console.log(`✅ ${response.data.length} proyectos obtenidos desde BD`);
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo proyectos de BD, usando modo offline:', error.message);
      return this.handleOfflineMode();
    }
  }

  /**
   * Obtener un proyecto específico por ID
   */
  async getProjectById(projectId) {
    try {
      console.log('📋 Obteniendo proyecto por ID:', projectId);
      
      const response = await this.apiService.get(`${this.endpoints.getById}/${projectId}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Proyecto no encontrado');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo proyecto de BD, buscando en cache:', error.message);
      return this.getProjectByIdOffline(projectId);
    }
  }

  /**
   * Crear nuevo proyecto en la base de datos
   */
  async createProject(projectData) {
    try {
      console.log('➕ Creando proyecto en BD:', projectData.name);
      
      // Preparar datos del proyecto
      const newProjectData = {
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: projectData.progress || 0
      };
      
      const response = await this.apiService.post(this.endpoints.create, newProjectData);
      
      if (response.success && response.data) {
        // Invalidar cache
        this.cache.projects = null;
        
        console.log('✅ Proyecto creado en BD:', response.data.name);
        return {
          success: true,
          data: response.data,
          message: 'Proyecto creado exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error creando proyecto');
      }
      
    } catch (error) {
      console.error('❌ Error creando proyecto:', error);
      
      // FALLBACK: Guardar en localStorage si no hay conexión
      return this.createProjectOffline(projectData);
    }
  }

  /**
   * Actualizar proyecto existente
   */
  async updateProject(projectId, updateData) {
    try {
      console.log('✏️ Actualizando proyecto en BD:', projectId);
      
      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      const response = await this.apiService.put(`${this.endpoints.update}/${projectId}`, updatePayload);
      
      if (response.success && response.data) {
        // Invalidar cache
        this.cache.projects = null;
        
        console.log('✅ Proyecto actualizado en BD');
        return {
          success: true,
          data: response.data,
          message: 'Proyecto actualizado exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error actualizando proyecto');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando proyecto:', error);
      
      // FALLBACK: Actualizar en localStorage
      return this.updateProjectOffline(projectId, updateData);
    }
  }

  /**
   * Eliminar proyecto
   */
  async deleteProject(projectId) {
    try {
      console.log('🗑️ Eliminando proyecto de BD:', projectId);
      
      const response = await this.apiService.delete(`${this.endpoints.delete}/${projectId}`);
      
      if (response.success) {
        // Invalidar cache
        this.cache.projects = null;
        
        console.log('✅ Proyecto eliminado de BD');
        return {
          success: true,
          message: 'Proyecto eliminado exitosamente'
        };
      } else {
        throw new Error(response.message || 'Error eliminando proyecto');
      }
      
    } catch (error) {
      console.error('❌ Error eliminando proyecto:', error);
      throw error;
    }
  }

  /**
   * Buscar proyectos
   */
  async searchProjects(query, filters = {}) {
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
      return this.searchProjectsOffline(query, filters);
    }
  }

  /**
   * Obtener proyectos del usuario actual
   */
  async getUserProjects(userId) {
    try {
      const response = await this.apiService.get(`${this.endpoints.getUserProjects}/${userId}`);
      
      if (response.success && response.data) {
        this.cache.userProjects = response.data;
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('Error obteniendo proyectos del usuario');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo proyectos de usuario, usando datos locales');
      return this.getUserProjectsOffline(userId);
    }
  }

  /**
   * Actualizar estado de proyecto
   */
  async updateProjectStatus(projectId, status) {
    try {
      const response = await this.apiService.put(`${this.endpoints.updateStatus}/${projectId}`, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      if (response.success && response.data) {
        this.cache.projects = null; // Invalidar cache
        return {
          success: true,
          data: response.data,
          message: `Estado actualizado a: ${status}`
        };
      } else {
        throw new Error('Error actualizando estado');
      }
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de proyectos
   */
  async getProjectStats() {
    try {
      const response = await this.apiService.get(this.endpoints.getProjectStats);
      
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
      return this.getProjectStatsOffline();
    }
  }

  // ===========================================
  // MÉTODOS DE FALLBACK OFFLINE
  // ===========================================

  /**
   * FALLBACK: Manejar modo offline cuando no hay conexión a BD
   */
  handleOfflineMode() {
    console.log('📱 Activando modo offline para proyectos');
    
    // Intentar usar cache primero
    if (this.cache.projects) {
      return {
        success: true,
        data: this.cache.projects,
        source: 'cache'
      };
    }
    
    // Usar localStorage como segundo recurso
    const localProjects = this.getLocalStorageProjects();
    if (localProjects.length > 0) {
      return {
        success: true,
        data: localProjects,
        source: 'localStorage'
      };
    }
    
    // Usar datos de ejemplo como último recurso
    return {
      success: true,
      data: this.sampleProjects,
      source: 'sample'
    };
  }

  /**
   * FALLBACK: Obtener proyecto por ID en modo offline
   */
  getProjectByIdOffline(projectId) {
    // Buscar en cache
    if (this.cache.projects) {
      const project = this.cache.projects.find(p => p.id === projectId);
      if (project) {
        return { success: true, data: project, source: 'cache' };
      }
    }
    
    // Buscar en localStorage
    const localProjects = this.getLocalStorageProjects();
    const project = localProjects.find(p => p.id === projectId);
    if (project) {
      return { success: true, data: project, source: 'localStorage' };
    }
    
    // Buscar en datos de ejemplo
    const sampleProject = this.sampleProjects.find(p => p.id === projectId);
    if (sampleProject) {
      return { success: true, data: sampleProject, source: 'sample' };
    }
    
    return { success: false, error: 'Proyecto no encontrado' };
  }

  /**
   * FALLBACK: Crear proyecto en localStorage
   */
  createProjectOffline(projectData) {
    const projects = this.getLocalStorageProjects();
    const newProject = {
      ...projectData,
      id: `offline_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'offline'
    };
    
    projects.push(newProject);
    this.saveLocalStorageProjects(projects);
    
    return {
      success: true,
      data: newProject,
      message: 'Proyecto guardado localmente (será sincronizado cuando haya conexión)'
    };
  }

  /**
   * FALLBACK: Actualizar proyecto en localStorage
   */
  updateProjectOffline(projectId, updateData) {
    const projects = this.getLocalStorageProjects();
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      this.saveLocalStorageProjects(projects);
      
      return {
        success: true,
        data: projects[index],
        message: 'Proyecto actualizado localmente'
      };
    }
    
    return { success: false, error: 'Proyecto no encontrado' };
  }

  /**
   * FALLBACK: Buscar en datos locales
   */
  searchProjectsOffline(query, filters) {
    const projects = this.getAllProjectsOffline();
    const results = projects.filter(project => {
      const matchesQuery = !query || 
        project.name?.toLowerCase().includes(query.toLowerCase()) ||
        project.description?.toLowerCase().includes(query.toLowerCase()) ||
        project.client?.toLowerCase().includes(query.toLowerCase());
      
      // Aplicar filtros
      if (filters.status && project.status !== filters.status) return false;
      if (filters.priority && project.priority !== filters.priority) return false;
      if (filters.manager && project.manager !== filters.manager) return false;
      
      return matchesQuery;
    });
    
    return {
      success: true,
      data: results,
      total: results.length,
      source: 'offline'
    };
  }

  /**
   * FALLBACK: Obtener proyectos de usuario offline
   */
  getUserProjectsOffline(userId) {
    const projects = this.getAllProjectsOffline();
    const userProjects = projects.filter(project => 
      project.manager === userId || project.team?.includes(userId)
    );
    
    return {
      success: true,
      data: userProjects,
      source: 'offline'
    };
  }

  /**
   * FALLBACK: Generar estadísticas offline
   */
  getProjectStatsOffline() {
    const projects = this.getAllProjectsOffline();
    
    const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      planning: projects.filter(p => p.status === 'planning').length,
      paused: projects.filter(p => p.status === 'paused').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalSpent: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
      avgProgress: projects.length > 0 
        ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length 
        : 0
    };
    
    return {
      success: true,
      data: stats,
      source: 'offline'
    };
  }

  // ===========================================
  // UTILIDADES DE CACHE Y ALMACENAMIENTO LOCAL
  // ===========================================

  /**
   * Obtener todos los proyectos disponibles (combinando fuentes)
   */
  getAllProjectsOffline() {
    if (this.cache.projects) return this.cache.projects;
    
    const localProjects = this.getLocalStorageProjects();
    if (localProjects.length > 0) return localProjects;
    
    return this.sampleProjects;
  }

  /**
   * Cachear proyectos para uso offline
   */
  cacheProjects(projects) {
    this.cache.projects = projects;
    this.cache.lastUpdate = new Date().toISOString();
  }

  /**
   * Obtener proyectos de localStorage
   */
  getLocalStorageProjects() {
    try {
      const stored = localStorage.getItem('projects');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error leyendo proyectos de localStorage:', error);
      return [];
    }
  }

  /**
   * Guardar proyectos en localStorage
   */
  saveLocalStorageProjects(projects) {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('projectsLastUpdate', new Date().toISOString());
    } catch (error) {
      console.error('❌ Error guardando proyectos en localStorage:', error);
    }
  }

  /**
   * Limpiar cache y datos locales
   */
  clearLocalData() {
    this.cache = { projects: null, lastUpdate: null, userProjects: null };
    localStorage.removeItem('projects');
    localStorage.removeItem('projectsLastUpdate');
  }

  /**
   * Verificar estado de conexión y datos
   */
  getDataStatus() {
    return {
      hasCache: !!this.cache.projects,
      hasLocalStorage: this.getLocalStorageProjects().length > 0,
      lastCacheUpdate: this.cache.lastUpdate,
      cacheSize: this.cache.projects?.length || 0,
      localStorageSize: this.getLocalStorageProjects().length,
      sampleDataSize: this.sampleProjects.length
    };
  }
}

// Exportar instancia singleton
export default new ProjectService();
