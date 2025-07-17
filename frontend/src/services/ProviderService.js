import axios from 'axios';

// Configuración base para las APIs de proveedores
const API_BASE_URL = 'http://localhost:3001/api';

// Clase para manejar diferentes proveedores
class ProviderService {
  constructor() {
    this.providers = {
      'sodimac': {
        name: 'Sodimac',
        baseUrl: 'https://www.sodimac.cl/sodimac-cl/search/',
        searchEndpoint: 'search',
        priceEndpoint: 'price',
        stockEndpoint: 'stock',
        icon: '🏪'
      },
      'easy': {
        name: 'Easy',
        baseUrl: 'https://www.easy.cl/easy-cl/search/',
        searchEndpoint: 'search',
        priceEndpoint: 'price',
        stockEndpoint: 'stock',
        icon: '🏬'
      },
      'construmart': {
        name: 'Construmart',
        baseUrl: 'https://www.construmart.cl/construmart-cl/search/',
        searchEndpoint: 'search',
        priceEndpoint: 'price',
        stockEndpoint: 'stock',
        icon: '🏭'
      },
      'imperial': {
        name: 'Imperial',
        baseUrl: 'https://www.imperial.cl/imperial-cl/search/',
        searchEndpoint: 'search',
        priceEndpoint: 'price',
        stockEndpoint: 'stock',
        icon: '🏛️'
      }
    };
  }

  // Obtener lista de proveedores disponibles
  getAvailableProviders() {
    return Object.entries(this.providers).map(([key, provider]) => ({
      id: key,
      name: provider.name,
      icon: provider.icon
    }));
  }

  // Buscar productos en un proveedor específico
  async searchProducts(providerId, query, options = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/providers/${providerId}/search`, {
        query,
        limit: options.limit || 20,
        filters: options.filters || {}
      });

      return {
        success: true,
        data: response.data.products || [],
        provider: this.providers[providerId]
      };
    } catch (error) {
      console.error(`Error searching in ${providerId}:`, error);
      return {
        success: false,
        error: error.message,
        provider: this.providers[providerId]
      };
    }
  }

  // Buscar en todos los proveedores
  async searchAllProviders(query, options = {}) {
    const providerIds = Object.keys(this.providers);
    const searches = providerIds.map(providerId => 
      this.searchProducts(providerId, query, options)
    );

    try {
      const results = await Promise.allSettled(searches);
      
      return results.map((result, index) => {
        const providerId = providerIds[index];
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            error: result.reason.message,
            provider: this.providers[providerId]
          };
        }
      });
    } catch (error) {
      console.error('Error searching all providers:', error);
      return [];
    }
  }

  // Obtener precio actual de un producto
  async getProductPrice(providerId, productId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/providers/${providerId}/price/${productId}`);
      
      return {
        success: true,
        data: response.data,
        provider: this.providers[providerId]
      };
    } catch (error) {
      console.error(`Error getting price from ${providerId}:`, error);
      return {
        success: false,
        error: error.message,
        provider: this.providers[providerId]
      };
    }
  }

  // Verificar stock de un producto
  async checkStock(providerId, productId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/providers/${providerId}/stock/${productId}`);
      
      return {
        success: true,
        data: response.data,
        provider: this.providers[providerId]
      };
    } catch (error) {
      console.error(`Error checking stock from ${providerId}:`, error);
      return {
        success: false,
        error: error.message,
        provider: this.providers[providerId]
      };
    }
  }

  // Comparar precios entre proveedores
  async comparePrice(productName, productSpecs = {}) {
    const allResults = await this.searchAllProviders(productName, { limit: 5 });
    
    const comparisons = allResults
      .filter(result => result.success && result.data.length > 0)
      .map(result => {
        const bestProduct = result.data[0]; // Asumimos que el primer resultado es el mejor match
        return {
          provider: result.provider,
          product: bestProduct,
          price: bestProduct.price,
          stock: bestProduct.stock,
          url: bestProduct.url
        };
      })
      .sort((a, b) => a.price - b.price); // Ordenar por precio

    return comparisons;
  }

  // Configurar alertas de precio
  async setupPriceAlert(productId, providerId, targetPrice, userEmail) {
    try {
      const response = await axios.post(`${API_BASE_URL}/price-alerts`, {
        productId,
        providerId,
        targetPrice,
        userEmail
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error setting up price alert:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener historial de precios
  async getPriceHistory(productId, providerId, days = 30) {
    try {
      const response = await axios.get(`${API_BASE_URL}/providers/${providerId}/price-history/${productId}`, {
        params: { days }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting price history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Crear orden de compra
  async createPurchaseOrder(items, providerId, deliveryInfo) {
    try {
      const response = await axios.post(`${API_BASE_URL}/providers/${providerId}/purchase-order`, {
        items,
        deliveryInfo,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating purchase order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instancia singleton del servicio
const providerService = new ProviderService();

export default providerService;

// Hooks para usar el servicio en componentes React
export const useProviderService = () => {
  return providerService;
};

// Funciones de utilidad
export const formatPrice = (price, currency = 'CLP') => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export const calculateSavings = (prices) => {
  if (prices.length < 2) return 0;
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const cheapest = sortedPrices[0];
  const mostExpensive = sortedPrices[sortedPrices.length - 1];
  return mostExpensive - cheapest;
};
