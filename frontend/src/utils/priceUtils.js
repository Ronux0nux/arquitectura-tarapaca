/**
 * Utilidades para manejo de precios en la aplicación
 */

/**
 * Formatea un precio para mostrar en la interfaz
 * @param {string|number} price - El precio a formatear
 * @returns {string} - El precio formateado
 */
export const formatPrice = (price) => {
  // Debug temporal - eliminar después de resolver el problema
  if (price && price.toString().includes('15082')) {
    console.log('🔍 Debug precio:', {
      original: price,
      type: typeof price,
      toString: price.toString()
    });
  }
  
  // Casos donde no hay precio válido
  if (!price || price === 'Precio no disponible' || price === 'Consultar' || price === null || price === undefined) {
    return 'Precio no disponible';
  }
  
  // Convertir a string para procesamiento uniforme
  const priceStr = price.toString().trim();
  
  // Si ya es un precio formateado correctamente (empieza con $ y no tiene duplicación)
  if (priceStr.startsWith('$') && !priceStr.includes('$', 1)) {
    return priceStr;
  }
  
  // Extraer SOLO números, puntos y comas del precio
  // Esto maneja casos como "15082 $15.082" → "15082"
  const matches = priceStr.match(/[\d.,]+/);
  if (!matches) {
    return 'Precio no disponible';
  }
  
  // Tomar solo la primera secuencia de números encontrada
  const cleanPrice = matches[0].replace(',', '.');
  const numericValue = parseFloat(cleanPrice);
  
  // Debug temporal
  if (price && price.toString().includes('15082')) {
    console.log('🔍 Debug después de procesar:', {
      matches,
      cleanPrice,
      numericValue,
      willReturn: new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP',
        minimumFractionDigits: 0 
      }).format(numericValue)
    });
  }
  
  // Validar que sea un número válido y positivo
  if (isNaN(numericValue) || numericValue <= 0) {
    return 'Precio no disponible';
  }
  
  // Formatear como moneda chilena
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP',
    minimumFractionDigits: 0 
  }).format(numericValue);
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
