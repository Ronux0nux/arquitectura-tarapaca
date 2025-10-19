import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const chatbotService = {
  /**
   * Enviar mensaje al chatbot
   * @param {Array} messages - Historial de mensajes
   * @param {Object} context - Contexto del usuario
   * @returns {Promise<Object>}
   */
  async sendMessage(messages, context = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot/message`, {
        messages,
        context
      });

      return {
        success: true,
        message: response.data.message,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Error al enviar mensaje al chatbot:', error);
      
      // Respuesta de fallback si falla la API
      return {
        success: false,
        message: error.response?.data?.message || 
                'Lo siento, no puedo responder en este momento. Por favor, intenta de nuevo.',
        error: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Obtener preguntas sugeridas
   * @returns {Promise<Array>}
   */
  async getSuggestions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/chatbot/suggestions`);
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      return [
        "¿Cómo crear una cotización?",
        "¿Cómo buscar materiales?",
        "¿Cómo exportar a Excel?"
      ];
    }
  },

  /**
   * Probar conexión con OpenAI
   * @returns {Promise<Object>}
   */
  async testConnection() {
    try {
      const response = await axios.get(`${API_BASE_URL}/chatbot/test`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Obtener estadísticas del chatbot
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/chatbot/stats`);
      return response.data.stats;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
};

export default chatbotService;
