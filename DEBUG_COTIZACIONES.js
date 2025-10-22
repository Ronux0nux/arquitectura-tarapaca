// 🔍 SCRIPT DE DEBUG - Ejecutar en consola del navegador
// Copia y pega esto en la consola del navegador para debuguear

console.log('=== VERIFICACIÓN DE COTIZACIONES ===');

// 1. Ver qué proyecto está seleccionado
const projectId = document.querySelector('[data-project-id]')?.dataset.projectId;
console.log('📦 Project ID:', projectId);

// 2. Hacer petición directa al API
const testFetch = async () => {
  try {
    const token = localStorage.getItem('tarapaca_token');
    console.log('🔐 Token disponible:', !!token);
    
    // Prueba 1: Listar todas las cotizaciones
    console.log('\n📋 Probando: GET /api/cotizaciones');
    const allResponse = await fetch('http://localhost:5000/api/cotizaciones', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const allCotizaciones = await allResponse.json();
    console.log('✅ Cotizaciones totales:', allCotizaciones.length);
    console.log('   Datos:', allCotizaciones.slice(0, 3));
    
    // Prueba 2: Obtener cotizaciones por proyecto
    if (projectId) {
      console.log(`\n🔎 Probando: GET /api/cotizaciones/project/${projectId}`);
      const projectResponse = await fetch(`http://localhost:5000/api/cotizaciones/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const projectData = await projectResponse.json();
      console.log('✅ Respuesta del servidor:', projectData);
      console.log('   Cotizaciones encontradas:', projectData.cotizaciones?.length || 0);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testFetch();
