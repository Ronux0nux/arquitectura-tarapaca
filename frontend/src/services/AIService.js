import axios from 'axios';

class AIService {
  constructor() {
    this.apiEndpoint = 'http://localhost:3001/api/ai';
    this.openaiEndpoint = 'http://localhost:3001/api/openai';
  }

  // Sugerir materiales similares basado en historial
  async suggestSimilarMaterials(currentMaterial, userHistory = []) {
    try {
      const response = await axios.post(`${this.apiEndpoint}/suggest-materials`, {
        currentMaterial,
        userHistory,
        context: 'arquitectura'
      });

      return {
        success: true,
        suggestions: response.data.suggestions,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Error suggesting materials:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Predecir precios basado en tendencias históricas
  async predictPrice(materialName, specifications = {}, timeframe = 30) {
    try {
      const response = await axios.post(`${this.apiEndpoint}/predict-price`, {
        materialName,
        specifications,
        timeframe,
        region: 'chile'
      });

      return {
        success: true,
        prediction: response.data.prediction,
        confidence: response.data.confidence,
        trend: response.data.trend,
        factors: response.data.factors
      };
    } catch (error) {
      console.error('Error predicting price:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Optimizar cotización automáticamente
  async optimizeQuotation(cotizacion) {
    try {
      const response = await axios.post(`${this.apiEndpoint}/optimize-quotation`, {
        cotizacion,
        criteria: ['cost', 'quality', 'availability'],
        preferences: {
          budgetConstraint: true,
          timeConstraint: false,
          qualityPriority: 'high'
        }
      });

      return {
        success: true,
        optimizedCotizacion: response.data.optimizedCotizacion,
        savings: response.data.savings,
        recommendations: response.data.recommendations,
        alternatives: response.data.alternatives
      };
    } catch (error) {
      console.error('Error optimizing quotation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Detectar materiales desde imagen
  async detectMaterialsFromImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('context', 'construction');

      const response = await axios.post(`${this.apiEndpoint}/detect-materials`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        detectedMaterials: response.data.materials,
        confidence: response.data.confidence,
        boundingBoxes: response.data.boundingBoxes
      };
    } catch (error) {
      console.error('Error detecting materials:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generar descripción automática de material
  async generateMaterialDescription(materialName, specifications = {}) {
    try {
      const response = await axios.post(`${this.openaiEndpoint}/generate-description`, {
        materialName,
        specifications,
        language: 'spanish',
        style: 'professional',
        includeSpecs: true
      });

      return {
        success: true,
        description: response.data.description,
        keywords: response.data.keywords,
        category: response.data.category
      };
    } catch (error) {
      console.error('Error generating description:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Análisis inteligente de cotización
  async analyzeCotizacion(cotizacion) {
    try {
      const response = await axios.post(`${this.apiEndpoint}/analyze-cotizacion`, {
        cotizacion,
        includeMarketComparison: true,
        includeTrends: true,
        includeRisks: true
      });

      return {
        success: true,
        analysis: {
          costAnalysis: response.data.costAnalysis,
          marketComparison: response.data.marketComparison,
          riskAssessment: response.data.riskAssessment,
          recommendations: response.data.recommendations,
          score: response.data.score
        }
      };
    } catch (error) {
      console.error('Error analyzing cotizacion:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Búsqueda inteligente con procesamiento de lenguaje natural
  async smartSearch(query, context = {}) {
    try {
      const response = await axios.post(`${this.apiEndpoint}/smart-search`, {
        query,
        context,
        language: 'spanish',
        domain: 'construction',
        includeAlternatives: true
      });

      return {
        success: true,
        results: response.data.results,
        interpretedQuery: response.data.interpretedQuery,
        alternatives: response.data.alternatives,
        filters: response.data.suggestedFilters
      };
    } catch (error) {
      console.error('Error in smart search:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generar reporte automático
  async generateReport(cotizaciones, timeframe = 'monthly') {
    try {
      const response = await axios.post(`${this.apiEndpoint}/generate-report`, {
        cotizaciones,
        timeframe,
        includeCharts: true,
        includeInsights: true,
        format: 'detailed'
      });

      return {
        success: true,
        report: response.data.report,
        insights: response.data.insights,
        charts: response.data.charts,
        recommendations: response.data.recommendations
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Chatbot para asistencia
  async chatWithAssistant(message, conversationHistory = []) {
    try {
      const response = await axios.post(`${this.openaiEndpoint}/chat`, {
        message,
        conversationHistory,
        context: 'arquitectura_cotizaciones',
        personality: 'professional_assistant'
      });

      return {
        success: true,
        response: response.data.response,
        suggestions: response.data.suggestions,
        actions: response.data.suggestedActions
      };
    } catch (error) {
      console.error('Error in chat:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Automatización de tareas repetitivas
  async automateTask(taskType, parameters = {}) {
    try {
      const response = await axios.post(`${this.apiEndpoint}/automate-task`, {
        taskType,
        parameters,
        userId: 'default'
      });

      return {
        success: true,
        result: response.data.result,
        automationId: response.data.automationId,
        schedule: response.data.schedule
      };
    } catch (error) {
      console.error('Error automating task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Configurar automatizaciones
  async setupAutomation(automationType, config) {
    const automations = {
      'price_alerts': {
        description: 'Alertas automáticas de cambios de precio',
        schedule: 'daily',
        action: 'check_price_changes'
      },
      'backup_reminder': {
        description: 'Recordatorio de backup automático',
        schedule: 'weekly',
        action: 'backup_data'
      },
      'cotizacion_followup': {
        description: 'Seguimiento automático de cotizaciones',
        schedule: 'daily',
        action: 'check_pending_cotizaciones'
      },
      'material_suggestions': {
        description: 'Sugerencias de materiales basadas en uso',
        schedule: 'weekly',
        action: 'analyze_usage_patterns'
      }
    };

    try {
      const automation = automations[automationType];
      if (!automation) {
        throw new Error('Tipo de automatización no válido');
      }

      const response = await axios.post(`${this.apiEndpoint}/setup-automation`, {
        type: automationType,
        config: { ...automation, ...config },
        userId: 'default'
      });

      return {
        success: true,
        automationId: response.data.automationId,
        schedule: response.data.schedule
      };
    } catch (error) {
      console.error('Error setting up automation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener insights y recomendaciones
  async getInsights(dataType = 'cotizaciones', timeframe = 'monthly') {
    try {
      const response = await axios.post(`${this.apiEndpoint}/insights`, {
        dataType,
        timeframe,
        userId: 'default'
      });

      return {
        success: true,
        insights: response.data.insights,
        trends: response.data.trends,
        recommendations: response.data.recommendations,
        metrics: response.data.metrics
      };
    } catch (error) {
      console.error('Error getting insights:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Procesar texto con IA (extraer información de documentos)
  async processDocument(text, documentType = 'cotizacion') {
    try {
      const response = await axios.post(`${this.openaiEndpoint}/process-document`, {
        text,
        documentType,
        extractFields: true,
        language: 'spanish'
      });

      return {
        success: true,
        extractedData: response.data.extractedData,
        structuredData: response.data.structuredData,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Error processing document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instancia singleton del servicio
const aiService = new AIService();

export default aiService;

// Hooks para usar el servicio en componentes React
export const useAIService = () => {
  return aiService;
};

// Funciones de utilidad para IA
export const formatAIResponse = (response) => {
  return {
    ...response,
    timestamp: new Date().toISOString()
  };
};

export const calculateConfidenceLevel = (confidence) => {
  if (confidence >= 0.8) return 'Alta';
  if (confidence >= 0.6) return 'Media';
  if (confidence >= 0.4) return 'Baja';
  return 'Muy Baja';
};
