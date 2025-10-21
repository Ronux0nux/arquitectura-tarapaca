/**
 * API Service Base
 * Servicio central para todas las llamadas HTTP al backend
 * 
 * CONFIGURACIÓN DE BASE DE DATOS:
 * - Backend: Express.js + MongoDB Atlas
 * - Base URL: http://localhost:5000/api (desarrollo) / /api (producción)
 * - Autenticación: JWT tokens en localStorage
 * 
 * PARA CAMBIAR LA BASE DE DATOS EN EL FUTURO:
 * 1. Cambiar BACKEND_URL si se cambia el servidor
 * 2. Modificar getAuthHeaders() si se cambia el método de autenticación
 * 3. Actualizar handleResponse() si cambia el formato de respuestas
 */

class ApiService {
  constructor() {
    // CONFIGURACIÓN DE URL DEL BACKEND
    // En desarrollo usa localhost:5000, en producción usa la URL relativa
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    this.BACKEND_URL = isDevelopment ? 'http://localhost:5000/api' : '/api';
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 1000; // ms
    
    console.log(`🔗 API Service configurado para: ${this.BACKEND_URL}`);
  }

  /**
   * Reintenta una operación con backoff exponencial
   */
  async retryWithBackoff(fn, retries = this.MAX_RETRIES) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // No reintentar para errores 4xx (excepto 408, 429, 503)
        if (error.status >= 400 && error.status < 500 && ![408, 429, 503].includes(error.status)) {
          throw error;
        }
        
        if (attempt < retries) {
          const delay = Math.min(this.RETRY_DELAY * Math.pow(2, attempt - 1), 10000);
          console.warn(`⚠️ Reintentando en ${delay}ms... (Intento ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Obtiene headers de autenticación desde localStorage
   * NOTA: Si cambias la autenticación (ej: cookies, session), modificar aquí
   */
  getAuthHeaders() {
    const token = localStorage.getItem('tarapaca_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Maneja las respuestas HTTP y errores
   * NOTA: Personalizar según formato de respuesta del backend
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || `Error HTTP: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
    } else {
      if (!response.ok) {
        const error = new Error(`Error HTTP: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return response;
    }
  }

  /**
   * Método GET genérico con reintentos
   */
  async get(endpoint) {
    return this.retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
        });
        
        return await this.handleResponse(response);
      } catch (error) {
        if (error.name === 'AbortError') {
          error.status = 408; // Request Timeout
        }
        throw error;
      }
    });
  }

  /**
   * Método POST genérico con reintentos
   */
  async post(endpoint, data) {
    return this.retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
        });
        
        return await this.handleResponse(response);
      } catch (error) {
        if (error.name === 'AbortError') {
          error.status = 408; // Request Timeout
        }
        throw error;
      }
    });
  }

  /**
   * Método PUT genérico con reintentos
   */
  async put(endpoint, data) {
    return this.retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
        });
        
        return await this.handleResponse(response);
      } catch (error) {
        if (error.name === 'AbortError') {
          error.status = 408; // Request Timeout
        }
        throw error;
      }
    });
  }

  /**
   * Método DELETE genérico con reintentos
   */
  async delete(endpoint) {
    return this.retryWithBackoff(async () => {
      try {
        const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
          signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
        });
        
        return await this.handleResponse(response);
      } catch (error) {
        if (error.name === 'AbortError') {
          error.status = 408; // Request Timeout
        }
        throw error;
      }
    });
  }

  /**
   * Verifica si el backend está disponible
   * Útil para manejar fallbacks cuando no hay conexión
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.BACKEND_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.warn('⚠️ Backend no disponible, usando modo offline');
      return false;
    }
  }
}

// Exportar instancia singleton
const apiService = new ApiService();
export default apiService;
