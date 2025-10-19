const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

/**
 * @route   POST /api/chatbot/message
 * @desc    Enviar mensaje al chatbot y obtener respuesta
 * @access  Public (puedes agregar autenticación si lo deseas)
 */
router.post('/message', chatbotController.sendMessage);

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Obtener preguntas sugeridas
 * @access  Public
 */
router.get('/suggestions', chatbotController.getSuggestions);

/**
 * @route   GET /api/chatbot/test
 * @desc    Probar conexión con OpenAI
 * @access  Public
 */
router.get('/test', chatbotController.testOpenAI);

/**
 * @route   GET /api/chatbot/stats
 * @desc    Obtener estadísticas de uso
 * @access  Public
 */
router.get('/stats', chatbotController.getStats);

module.exports = router;
