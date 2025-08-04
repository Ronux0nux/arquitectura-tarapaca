/**
 * Project Excel Service
 * Maneja la integración entre proyectos específicos y plantillas Excel
 * 
 * CONFIGURACIÓN ACTUAL:
 * - Base de datos: MongoDB Atlas (colección 'projects')
 * - Integración: Excel templates con datos específicos del proyecto
 * - Funcionalidades: Presupuestos, APUs, Recursos por proyecto
 * 
 * PARA CAMBIAR BASE DE DATOS:
 * 1. Modificar endpoints si cambian las rutas del backend
 * 2. Actualizar generateProjectExcelData() si cambias estructura de proyecto
 * 3. Cambiar templateMapping si modificas las plantillas Excel
 * 4. Ajustar calculateProjectTotals() si cambias cálculos de presupuesto
 */

import ApiService from './ApiService';
import CotizacionService from './CotizacionService';
import ProviderService from './ProviderService';

class ProjectExcelService {
  constructor() {
    this.apiService = ApiService;
    
    // CONFIGURACIÓN DE ENDPOINTS PARA PROYECTOS
    this.endpoints = {
      projects: '/projects',
      projectById: '/projects',
      projectMaterials: '/projects/materials',
      projectBudget: '/projects/budget',
      projectAPUs: '/projects/apus',
      projectResources: '/projects/resources',
      projectExcelData: '/projects/excel-data'
    };

    // Plantillas Excel disponibles por tipo de proyecto
    this.excelTemplates = {
      construction: {
        name: 'Construcción',
        sheets: ['Presupuesto', 'APU', 'Recursos', 'Cronograma', 'Resumen'],
        icon: '🏗️'
      },
      architecture: {
        name: 'Arquitectura',
        sheets: ['Presupuesto', 'Materiales', 'Acabados', 'Planos', 'Costos'],
        icon: '🏛️'
      },
      infrastructure: {
        name: 'Infraestructura',
        sheets: ['Presupuesto', 'Movimiento Tierra', 'Estructuras', 'Instalaciones'],
        icon: '🛣️'
      },
      renovation: {
        name: 'Remodelación',
        sheets: ['Presupuesto', 'Demolición', 'Construcción', 'Acabados'],
        icon: '🔨'
      }
    };

    // Datos de ejemplo para proyectos
    this.sampleProjects = [
      {
        id: 'proj_1',
        name: 'Edificio Corporativo Las Condes',
        type: 'construction',
        status: 'active',
        budget: 850000000,
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        location: 'Las Condes, Santiago',
        client: 'Inmobiliaria Premium S.A.',
        description: 'Construcción de edificio corporativo de 15 pisos',
        materials: [
          {
            id: 'mat_1',
            description: 'Cemento Portland',
            quantity: 500,
            unit: 'sacos',
            unitPrice: 8500,
            totalPrice: 4250000,
            provider: 'Cementos Biobío',
            category: 'Materiales Base'
          },
          {
            id: 'mat_2',
            description: 'Fierro corrugado 12mm',
            quantity: 200,
            unit: 'barras',
            unitPrice: 12000,
            totalPrice: 2400000,
            provider: 'CAP Acero',
            category: 'Estructural'
          }
        ],
        apus: [
          {
            id: 'apu_1',
            description: 'Excavación terreno natural',
            unit: 'm³',
            quantity: 1500,
            items: [
              { type: 'MANO DE OBRA', description: 'Operario excavadora', quantity: 8, unit: 'hrs', price: 25000 },
              { type: 'EQUIPO', description: 'Excavadora CAT 320', quantity: 8, unit: 'hrs', price: 45000 },
              { type: 'MATERIAL', description: 'Combustible', quantity: 120, unit: 'lts', price: 800 }
            ],
            totalUnit: 560000,
            totalAPU: 840000000
          }
        ],
        resources: [
          {
            type: 'MANO DE OBRA',
            description: 'Maestro constructor',
            quantity: 2,
            unit: 'personas',
            dailyRate: 45000,
            totalDays: 300,
            totalCost: 27000000
          },
          {
            type: 'EQUIPO',
            description: 'Grúa torre',
            quantity: 1,
            unit: 'unidad',
            dailyRate: 120000,
            totalDays: 200,
            totalCost: 24000000
          }
        ]
      },
      {
        id: 'proj_2',
        name: 'Casa Habitación Providencia',
        type: 'architecture',
        status: 'planning',
        budget: 180000000,
        startDate: '2024-05-01',
        endDate: '2024-12-31',
        location: 'Providencia, Santiago',
        client: 'Familia González',
        description: 'Construcción casa habitación 180m²',
        materials: [
          {
            id: 'mat_3',
            description: 'Ladrillo princesa',
            quantity: 15000,
            unit: 'unidades',
            unitPrice: 350,
            totalPrice: 5250000,
            provider: 'Ladrillos Cordillera',
            category: 'Mampostería'
          }
        ],
        apus: [
          {
            id: 'apu_2',
            description: 'Muro albañilería ladrillo',
            unit: 'm²',
            quantity: 240,
            totalUnit: 25000,
            totalAPU: 6000000
          }
        ],
        resources: [
          {
            type: 'MANO DE OBRA',
            description: 'Albañil',
            quantity: 3,
            unit: 'personas',
            dailyRate: 35000,
            totalDays: 120,
            totalCost: 12600000
          }
        ]
      }
    ];

    console.log('📊 ProjectExcelService inicializado');
  }

  /**
   * Obtener todos los proyectos desde la base de datos
   */
  async getAllProjects() {
    try {
      console.log('📋 Obteniendo proyectos desde BD...');
      
      const response = await this.apiService.get(this.endpoints.projects);
      
      if (response.success && response.data) {
        console.log(`✅ ${response.data.length} proyectos obtenidos`);
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('No se pudieron obtener los proyectos');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo proyectos, usando datos de ejemplo:', error.message);
      return {
        success: true,
        data: this.sampleProjects,
        source: 'sample'
      };
    }
  }

  /**
   * Obtener proyecto específico con todos sus datos para Excel
   */
  async getProjectExcelData(projectId) {
    try {
      console.log('📊 Obteniendo datos Excel para proyecto:', projectId);
      
      const response = await this.apiService.get(`${this.endpoints.projectExcelData}/${projectId}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          source: 'database'
        };
      } else {
        throw new Error('No se pudieron obtener datos del proyecto');
      }
      
    } catch (error) {
      console.warn('⚠️ Error obteniendo datos del proyecto, generando desde datos locales');
      return this.generateProjectExcelDataOffline(projectId);
    }
  }

  /**
   * Generar datos Excel específicos para un proyecto
   */
  async generateProjectExcelData(projectId) {
    try {
      // Obtener datos del proyecto
      const projectResponse = await this.getProjectById(projectId);
      if (!projectResponse.success) {
        throw new Error('Proyecto no encontrado');
      }

      const project = projectResponse.data;
      const template = this.excelTemplates[project.type] || this.excelTemplates.construction;

      // Obtener cotizaciones del proyecto
      const cotizacionesResponse = await CotizacionService.getCotizacionesByProject(projectId);
      const cotizaciones = cotizacionesResponse.success ? cotizacionesResponse.data : [];

      // Generar datos para cada hoja del Excel
      const excelData = {
        project: project,
        template: template,
        sheets: {}
      };

      // Hoja de Presupuesto
      if (template.sheets.includes('Presupuesto')) {
        excelData.sheets.Presupuesto = this.generateBudgetSheet(project, cotizaciones);
      }

      // Hoja de APU
      if (template.sheets.includes('APU')) {
        excelData.sheets.APU = this.generateAPUSheet(project);
      }

      // Hoja de Recursos
      if (template.sheets.includes('Recursos')) {
        excelData.sheets.Recursos = this.generateResourcesSheet(project);
      }

      // Hoja de Materiales
      if (template.sheets.includes('Materiales')) {
        excelData.sheets.Materiales = this.generateMaterialsSheet(project);
      }

      // Hoja de Resumen
      if (template.sheets.includes('Resumen')) {
        excelData.sheets.Resumen = this.generateSummarySheet(project, cotizaciones);
      }

      return {
        success: true,
        data: excelData,
        source: 'generated'
      };

    } catch (error) {
      console.error('❌ Error generando datos Excel:', error);
      throw error;
    }
  }

  /**
   * Generar hoja de presupuesto
   */
  generateBudgetSheet(project, cotizaciones) {
    const headers = ['Item', 'Descripción', 'Cantidad', 'Unidad', 'Precio Unit.', 'Precio Total', 'Proveedor', 'Estado'];
    const data = [headers];

    // Agregar datos del presupuesto base del proyecto
    if (project.materials && project.materials.length > 0) {
      project.materials.forEach((material, index) => {
        data.push([
          index + 1,
          material.description,
          material.quantity,
          material.unit,
          this.formatCurrency(material.unitPrice),
          this.formatCurrency(material.totalPrice),
          material.provider,
          'Planificado'
        ]);
      });
    }

    // Agregar items de cotizaciones aprobadas
    cotizaciones.filter(c => c.status === 'approved').forEach(cotizacion => {
      if (cotizacion.items) {
        cotizacion.items.forEach((item, index) => {
          data.push([
            `COT-${item.id}`,
            item.description,
            item.quantity,
            item.unit,
            this.formatCurrency(item.unitPrice),
            this.formatCurrency(item.totalPrice),
            cotizacion.providerName,
            'Cotizado'
          ]);
        });
      }
    });

    // Fila de totales
    const totalPresupuesto = this.calculateBudgetTotal(project, cotizaciones);
    data.push([
      '',
      'TOTAL PRESUPUESTO',
      '',
      '',
      '',
      this.formatCurrency(totalPresupuesto),
      '',
      ''
    ]);

    return {
      headers,
      data,
      config: {
        colHeaders: headers,
        columns: [
          { type: 'text', width: 60 },
          { type: 'text', width: 300 },
          { type: 'numeric', width: 80 },
          { type: 'text', width: 80 },
          { type: 'text', width: 120 },
          { type: 'text', width: 120 },
          { type: 'text', width: 150 },
          { type: 'dropdown', source: ['Planificado', 'Cotizado', 'Comprado', 'Entregado'], width: 100 }
        ],
        rowHeaders: true,
        contextMenu: true,
        manualColumnResize: true,
        manualRowResize: true
      }
    };
  }

  /**
   * Generar hoja de APU (Análisis de Precios Unitarios)
   */
  generateAPUSheet(project) {
    const headers = ['Actividad', 'Tipo', 'Descripción', 'Cantidad', 'Unidad', 'Precio Unit.', 'Precio Total'];
    const data = [headers];

    if (project.apus && project.apus.length > 0) {
      project.apus.forEach(apu => {
        // Fila principal del APU
        data.push([
          apu.description,
          'APU',
          `${apu.description} (${apu.unit})`,
          apu.quantity,
          apu.unit,
          this.formatCurrency(apu.totalUnit),
          this.formatCurrency(apu.totalAPU)
        ]);

        // Detalles del APU
        if (apu.items) {
          apu.items.forEach(item => {
            data.push([
              '',
              item.type,
              item.description,
              item.quantity,
              item.unit,
              this.formatCurrency(item.price),
              this.formatCurrency(item.quantity * item.price)
            ]);
          });
        }

        // Línea separadora
        data.push(['', '', '', '', '', '', '']);
      });
    }

    return {
      headers,
      data,
      config: {
        colHeaders: headers,
        columns: [
          { type: 'text', width: 250 },
          { type: 'dropdown', source: ['APU', 'MATERIAL', 'MANO DE OBRA', 'EQUIPO', 'SUBCONTRATO'], width: 120 },
          { type: 'text', width: 300 },
          { type: 'numeric', width: 100 },
          { type: 'text', width: 80 },
          { type: 'text', width: 120 },
          { type: 'text', width: 120 }
        ]
      }
    };
  }

  /**
   * Generar hoja de recursos
   */
  generateResourcesSheet(project) {
    const headers = ['Tipo', 'Descripción', 'Cantidad', 'Unidad', 'Tarifa Diaria', 'Días Total', 'Costo Total'];
    const data = [headers];

    if (project.resources && project.resources.length > 0) {
      project.resources.forEach(resource => {
        data.push([
          resource.type,
          resource.description,
          resource.quantity,
          resource.unit,
          this.formatCurrency(resource.dailyRate),
          resource.totalDays,
          this.formatCurrency(resource.totalCost)
        ]);
      });

      // Totales por tipo
      const totalesPorTipo = this.calculateResourceTotals(project.resources);
      Object.entries(totalesPorTipo).forEach(([tipo, total]) => {
        data.push([
          `TOTAL ${tipo}`,
          '',
          '',
          '',
          '',
          '',
          this.formatCurrency(total)
        ]);
      });
    }

    return {
      headers,
      data,
      config: {
        colHeaders: headers,
        columns: [
          { type: 'dropdown', source: ['MANO DE OBRA', 'EQUIPO', 'SUBCONTRATO'], width: 150 },
          { type: 'text', width: 300 },
          { type: 'numeric', width: 100 },
          { type: 'text', width: 80 },
          { type: 'text', width: 120 },
          { type: 'numeric', width: 100 },
          { type: 'text', width: 120 }
        ]
      }
    };
  }

  /**
   * Generar hoja de materiales
   */
  generateMaterialsSheet(project) {
    const headers = ['Material', 'Categoría', 'Cantidad', 'Unidad', 'Precio Unit.', 'Precio Total', 'Proveedor', 'Estado'];
    const data = [headers];

    if (project.materials && project.materials.length > 0) {
      project.materials.forEach(material => {
        data.push([
          material.description,
          material.category,
          material.quantity,
          material.unit,
          this.formatCurrency(material.unitPrice),
          this.formatCurrency(material.totalPrice),
          material.provider,
          'Planificado'
        ]);
      });
    }

    return {
      headers,
      data,
      config: {
        colHeaders: headers,
        columns: [
          { type: 'text', width: 250 },
          { type: 'text', width: 150 },
          { type: 'numeric', width: 100 },
          { type: 'text', width: 80 },
          { type: 'text', width: 120 },
          { type: 'text', width: 120 },
          { type: 'text', width: 150 },
          { type: 'dropdown', source: ['Planificado', 'Solicitado', 'Comprado', 'Entregado'], width: 100 }
        ]
      }
    };
  }

  /**
   * Generar hoja de resumen del proyecto
   */
  generateSummarySheet(project, cotizaciones) {
    const data = [
      ['RESUMEN DEL PROYECTO', ''],
      ['', ''],
      ['Información General', ''],
      ['Nombre:', project.name],
      ['Tipo:', this.excelTemplates[project.type]?.name || project.type],
      ['Cliente:', project.client],
      ['Ubicación:', project.location],
      ['Fecha Inicio:', project.startDate],
      ['Fecha Fin:', project.endDate],
      ['Estado:', project.status],
      ['', ''],
      ['Presupuesto', ''],
      ['Presupuesto Original:', this.formatCurrency(project.budget)],
      ['Total Materiales:', this.formatCurrency(this.calculateMaterialsTotal(project))],
      ['Total Recursos:', this.formatCurrency(this.calculateResourcesTotal(project))],
      ['Total Cotizaciones:', this.formatCurrency(this.calculateCotizacionesTotal(cotizaciones))],
      ['', ''],
      ['Estadísticas', ''],
      ['Cotizaciones Pendientes:', cotizaciones.filter(c => c.status === 'pending').length],
      ['Cotizaciones Aprobadas:', cotizaciones.filter(c => c.status === 'approved').length],
      ['Total Items Presupuesto:', project.materials?.length || 0],
      ['Total APUs:', project.apus?.length || 0],
      ['Total Recursos:', project.resources?.length || 0]
    ];

    return {
      headers: ['Concepto', 'Valor'],
      data,
      config: {
        colHeaders: ['Concepto', 'Valor'],
        columns: [
          { type: 'text', width: 300 },
          { type: 'text', width: 200 }
        ]
      }
    };
  }

  // ===========================================
  // MÉTODOS AUXILIARES Y CÁLCULOS
  // ===========================================

  /**
   * Obtener proyecto por ID
   */
  async getProjectById(projectId) {
    try {
      const response = await this.apiService.get(`${this.endpoints.projectById}/${projectId}`);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        throw new Error('Proyecto no encontrado');
      }
    } catch (error) {
      // Buscar en datos de ejemplo
      const project = this.sampleProjects.find(p => p.id === projectId);
      if (project) {
        return { success: true, data: project, source: 'sample' };
      }
      return { success: false, error: 'Proyecto no encontrado' };
    }
  }

  /**
   * Calcular total del presupuesto
   */
  calculateBudgetTotal(project, cotizaciones) {
    let total = 0;
    
    // Sumar materiales del proyecto
    if (project.materials) {
      total += project.materials.reduce((sum, material) => sum + (material.totalPrice || 0), 0);
    }
    
    // Sumar cotizaciones aprobadas
    const approvedCotizaciones = cotizaciones.filter(c => c.status === 'approved');
    total += approvedCotizaciones.reduce((sum, cotizacion) => sum + (cotizacion.total || 0), 0);
    
    return total;
  }

  /**
   * Calcular totales de recursos por tipo
   */
  calculateResourceTotals(resources) {
    const totales = {};
    
    resources.forEach(resource => {
      if (!totales[resource.type]) {
        totales[resource.type] = 0;
      }
      totales[resource.type] += resource.totalCost || 0;
    });
    
    return totales;
  }

  /**
   * Calcular total de materiales
   */
  calculateMaterialsTotal(project) {
    if (!project.materials) return 0;
    return project.materials.reduce((sum, material) => sum + (material.totalPrice || 0), 0);
  }

  /**
   * Calcular total de recursos
   */
  calculateResourcesTotal(project) {
    if (!project.resources) return 0;
    return project.resources.reduce((sum, resource) => sum + (resource.totalCost || 0), 0);
  }

  /**
   * Calcular total de cotizaciones
   */
  calculateCotizacionesTotal(cotizaciones) {
    return cotizaciones.reduce((sum, cotizacion) => sum + (cotizacion.total || 0), 0);
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  }

  /**
   * FALLBACK: Generar datos Excel offline
   */
  generateProjectExcelDataOffline(projectId) {
    const project = this.sampleProjects.find(p => p.id === projectId);
    
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' };
    }

    return this.generateProjectExcelData(projectId);
  }

  /**
   * Obtener plantillas disponibles
   */
  getAvailableTemplates() {
    return Object.entries(this.excelTemplates).map(([key, template]) => ({
      id: key,
      ...template
    }));
  }

  /**
   * Verificar estado del servicio
   */
  getServiceStatus() {
    return {
      templates: Object.keys(this.excelTemplates).length,
      sampleProjects: this.sampleProjects.length,
      endpoints: Object.keys(this.endpoints).length
    };
  }
}

// Exportar instancia singleton
export default new ProjectExcelService();
