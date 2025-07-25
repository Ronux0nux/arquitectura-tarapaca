/**
 * Utilidades para manejo de precios en la aplicación
 */

/**
 * Formatea un precio para mostrar en la interfaz
 * @param {string|number} price - El precio a formatear
 * @returns {string} - El precio formateado
 */
export const formatPrice = (price) => {
  if (!price || price === 'Precio no disponible' || price === 'Consultar') {
    return 'Precio no disponible';
  }
  
  // Si ya es un string que contiene $, devolverlo tal como está
  if (typeof price === 'string' && price.includes('$')) {
    return price;
  }
  
  // Si es un número, convertirlo a formato de moneda chilena
  if (typeof price === 'number') {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0 
    }).format(price);
  }
  
  // Si es un string sin $, intentar parsearlo y formatearlo
  const numericPrice = parseFloat(price.toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
  if (!isNaN(numericPrice) && numericPrice > 0) {
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0 
    }).format(numericPrice);
  }
  
  return 'Precio no disponible';
};

/**
 * Extrae el valor numérico de un precio
 * @param {string|number} price - El precio del cual extraer el valor
 * @returns {number} - El valor numérico del precio
 */
export const extractNumericPrice = (price) => {
  if (!price) return 0;
  
  if (typeof price === 'number') return price;
  
  // Extraer números del string, eliminando símbolos de moneda y espacios
  const numericPrice = parseFloat(price.toString().replace(/[^0-9.,]/g, '').replace(',', '.'));
  return isNaN(numericPrice) ? 0 : numericPrice;
};

/**
 * Calcula el total de una línea (precio * cantidad)
 * @param {string|number} price - El precio unitario
 * @param {number} quantity - La cantidad
 * @returns {string} - El total formateado o "Consultar" si no hay precio
 */
export const calculateLineTotal = (price, quantity = 1) => {
  const numericPrice = extractNumericPrice(price);
  
  if (numericPrice === 0) return 'Consultar';
  
  const total = numericPrice * quantity;
  return formatPrice(total);
};

/**
 * Suma una lista de precios
 * @param {Array} prices - Array de precios a sumar
 * @returns {number} - La suma total
 */
export const sumPrices = (prices) => {
  return prices.reduce((sum, price) => {
    return sum + extractNumericPrice(price);
  }, 0);
};
