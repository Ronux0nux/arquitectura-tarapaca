const express = require('express');
const router = express.Router();
const axios = require('axios');

// Endpoint para búsqueda de materiales usando SerpApi
router.post('/search', async (req, res) => {
  try {
    const { searchTerm, searchType = 'organic' } = req.body;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }

    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    if (!SERPAPI_KEY) {
      return res.status(500).json({ error: 'API Key de SerpApi no configurada en el servidor' });
    }

    const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

    const params = {
      engine: 'google',
      q: `${searchTerm} materiales construcción precio`,
      api_key: SERPAPI_KEY,
      location: 'Chile',
      hl: 'es',
      gl: 'cl',
      num: 10
    };

    // Si es búsqueda de shopping, agregamos parámetros específicos
    if (searchType === 'shopping') {
      params.tbm = 'shop';
      params.q = `${searchTerm} materiales construcción`;
    }

    const response = await axios.get(SERPAPI_BASE_URL, { params });
    
    if (response.data.error) {
      return res.status(400).json({ error: response.data.error });
    }

    // Procesar resultados según el tipo de búsqueda
    let processedResults = [];
    
    if (searchType === 'shopping' && response.data.shopping_results) {
      processedResults = response.data.shopping_results.map(item => ({
        title: item.title,
        price: item.price,
        source: item.source,
        link: item.link,
        thumbnail: item.thumbnail,
        type: 'shopping'
      }));
    } else if (response.data.organic_results) {
      processedResults = response.data.organic_results.map(item => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        source: item.displayed_link,
        type: 'organic'
      }));
    }

    res.json({
      results: processedResults,
      searchInfo: response.data.search_information,
      searchTerm,
      searchType
    });

  } catch (error) {
    console.error('Error en búsqueda SerpApi:', error);
    res.status(500).json({ 
      error: 'Error al realizar la búsqueda',
      details: error.message 
    });
  }
});

module.exports = router;
