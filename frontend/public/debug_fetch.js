// 🔍 DEBUG SCRIPT - Ejecutar en consola del navegador
// Monitorea todos los fetch POST

console.log('🚀 Iniciando monitoreo de requests...');

// Interceptar fetch
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [resource, config] = args;
  const method = config?.method || 'GET';
  
  if (method === 'POST') {
    console.log(`
    📤 POST REQUEST:
    URL: ${resource}
    Headers: ${JSON.stringify(config?.headers)}
    Body: ${config?.body}
    `);
  }
  
  return originalFetch.apply(this, args)
    .then(response => {
      console.log(`✅ Response: ${method} ${resource} -> ${response.status}`);
      return response;
    })
    .catch(error => {
      console.error(`❌ Error: ${method} ${resource} -> ${error.message}`);
      throw error;
    });
};

console.log('✅ Monitoreo activo. Ahora haz clic en "Exportar" en el carrito.');
console.log('Deberías ver un POST a http://localhost:5000/api/cotizaciones');
