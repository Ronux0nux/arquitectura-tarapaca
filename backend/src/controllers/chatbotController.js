const { generateChatResponse, getSuggestedQuestions, testConnection } = require('../config/openai');
const logger = require('../config/logger');

/**
 * Enviar mensaje al chatbot
 * POST /api/chatbot/message
 * Body: { messages: [...], context: {...} }
 */
exports.sendMessage = async (req, res) => {
  try {
    const { messages, context } = req.body;

    // Validar entrada
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de mensajes no vacío'
      });
    }

    // Validar formato de mensajes
    const isValidFormat = messages.every(
      msg => msg.role && msg.content && ['user', 'assistant'].includes(msg.role)
    );

    if (!isValidFormat) {
      return res.status(400).json({
        success: false,
        error: 'Formato de mensajes inválido. Esperado: {role: "user"|"assistant", content: "..."}'
      });
    }

    // Generar respuesta
    const response = await generateChatResponse(messages, context);

    if (response.success) {
      logger.info(`💬 Chatbot respondió exitosamente (${response.usage.totalTokens} tokens)`);
      res.json(response);
    } else {
      logger.error(`❌ Error en chatbot: ${response.error}`);
      res.status(500).json({
        success: false,
        error: response.error,
        message: response.fallback
      });
    }

  } catch (error) {
    logger.error(`❌ Error en sendMessage: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'Lo siento, ocurrió un error. Por favor, intenta de nuevo.'
    });
  }
};

/**
 * Obtener preguntas sugeridas
 * GET /api/chatbot/suggestions
 */
exports.getSuggestions = (req, res) => {
  try {
    const suggestions = getSuggestedQuestions();
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    logger.error(`❌ Error al obtener sugerencias: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Probar conexión con OpenAI
 * GET /api/chatbot/test
 */
exports.testOpenAI = async (req, res) => {
  try {
    const result = await testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Conexión con OpenAI exitosa',
        response: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error(`❌ Error al probar OpenAI: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de uso
 * GET /api/chatbot/stats
 */
exports.getStats = async (req, res) => {
  try {
    // Aquí podrías implementar tracking de uso si lo necesitas
    res.json({
      success: true,
      stats: {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: process.env.OPENAI_MAX_TOKENS || 800,
        temperature: process.env.OPENAI_TEMPERATURE || 0.7,
        estimatedCostPerMessage: '~$0.001 - $0.003'
      }
    });
  } catch (error) {
    logger.error(`❌ Error al obtener stats: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
