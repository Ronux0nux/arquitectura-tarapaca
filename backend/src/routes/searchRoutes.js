const express = require('express');
const router = express.Router();
const axios = require('axios');

// Endpoint para búsqueda de materiales usando SerpApi
router.post('/search', async (req, res) => {
  try {
    console.log('🔥🔥🔥 BÚSQUEDA INICIADA EN SERPAPI 🔥🔥🔥');
    console.log('📝 Body recibido:', req.body);
    
    const { searchTerm, searchType = 'organic' } = req.body;
    console.log(`🔍 Buscando: "${searchTerm}" | Tipo: ${searchType}`);

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

    // DEBUG: Log la estructura completa de SerpAPI
    console.log('📡 SERPAPI FULL RESPONSE KEYS:', Object.keys(response.data));
    console.log('📡 Has shopping_results?', !!response.data.shopping_results);
    console.log('📡 Has organic_results?', !!response.data.organic_results);
    console.log('📡 Shopping results count:', response.data.shopping_results?.length || 0);

    // 🔥 LOG COMPLETO DEL PRIMER RESULTADO
    if (response.data.shopping_results && response.data.shopping_results.length > 0) {
      console.log('🔥🔥🔥 PRIMER SHOPPING RESULT COMPLETO 🔥🔥🔥');
      console.log(JSON.stringify(response.data.shopping_results[0], null, 2));
    }

    // Procesar resultados según el tipo de búsqueda
    let processedResults = [];
    
    if (searchType === 'shopping' && response.data.shopping_results) {
      processedResults = response.data.shopping_results.map(item => {
        // Construir link basado en la fuente (tienda)
        let link = item.link || item.product_link || item.url || item.shopping_link;
        
        if (!link) {
          // Si no hay link directo, construir URL de búsqueda por tienda
          const productName = encodeURIComponent(item.title || '');
          const source = (item.source || '').toLowerCase();
          
          if (source.includes('lider')) {
            link = `https://www.lider.cl/tienda/search?query=${productName}`;
          } else if (source.includes('easy')) {
            link = `https://www.easy.cl/easy/search?query=${productName}`;
          } else if (source.includes('sodimac')) {
            link = `https://www.sodimac.cl/sodimac/search?query=${productName}`;
          } else if (source.includes('construmart')) {
            link = `https://www.construmart.cl/construmart/search?query=${productName}`;
          } else if (source.includes('falabella') || source.includes('falabella.com')) {
            link = `https://www.falabella.com/falabella/search?query=${productName}`;
          } else if (source.includes('ferreteriaexpress') || source.includes('ferretería express')) {
            link = `https://www.ferreteriaexpress.cl/search?query=${productName}`;
          } else {
            // Fallback: búsqueda en Google
            link = `https://www.google.com/search?q=${productName}+${encodeURIComponent(source)}`;
          }
        }
        
        // Extraer thumbnail/imagen
        const thumbnail = item.thumbnail 
          || item.image 
          || item.product_image 
          || null;
        
        // Debug: log detallado para ver estructura completa
        console.log('�️ SERPAPI shopping result:', {
          title: item.title?.substring(0, 50),
          price: item.price,
          source: item.source,
          link: link?.substring(0, 80),
          hasImage: !!thumbnail,
          allKeys: Object.keys(item)
        });
        
        return {
          title: item.title,
          price: item.price,
          source: item.source,
          link: link,
          thumbnail: thumbnail,
          product_link: item.product_link,
          rating: item.rating,
          reviews: item.reviews,
          type: 'shopping'
        };
      });
    } else if (response.data.organic_results) {
      processedResults = response.data.organic_results.map(item => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        source: item.displayed_link,
        type: 'organic'
      }));
    } else if (response.data.shopping_results && searchType !== 'shopping') {
      // Fallback: si hay shopping_results pero no pidió shopping específicamente
      processedResults = response.data.shopping_results.map(item => ({
        title: item.title,
        price: item.price,
        source: item.source,
        link: item.link || item.product_link || `https://www.google.com/search?q=${encodeURIComponent(item.title || '')}`,
        thumbnail: item.thumbnail || item.image,
        type: 'shopping'
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
