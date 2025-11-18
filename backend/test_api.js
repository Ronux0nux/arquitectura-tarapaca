const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Probando nuevos endpoints de gestión de proyectos...\n');
    
    // 1. GET /api/projects - Ver datos completos
    console.log('1️⃣  GET /api/projects');
    const projects = await axios.get('http://localhost:5000/api/projects');
    const project = projects.data[0];
    console.log(`   ✅ ${projects.data.length} proyectos obtenidos`);
    console.log(`   📊 Proyecto: "${project.nombre}"`);
    console.log(`   💰 Presupuesto: $${project.presupuesto_total} / Gastado: $${project.presupuesto_gastado}`);
    console.log(`   📈 Avance: ${project.porcentaje_avance}%`);
    console.log(`   🎯 Hitos: ${project.total_hitos} (${project.hitos_completados} completados)`);
    console.log(`   💸 Gastos: ${project.total_gastos}`);
    console.log(`   📁 Archivos: ${project.total_archivos}`);
    console.log(`   ⚠️  Alertas activas: ${project.alertas_activas}\n`);
    
    // 2. GET /api/projects/:id - Ver proyecto con detalles
    console.log(`2️⃣  GET /api/projects/${project.id}`);
    const detail = await axios.get(`http://localhost:5000/api/projects/${project.id}`);
    console.log(`   ✅ Proyecto con datos completos obtenido`);
    console.log(`   🎯 Hitos incluidos: ${detail.data.hitos?.length || 0}`);
    console.log(`   💸 Gastos incluidos: ${detail.data.gastos?.length || 0}`);
    console.log(`   ⚠️  Alertas incluidas: ${detail.data.alertas?.length || 0}\n`);
    
    // 3. GET /api/projects/:id/hitos
    console.log(`3️⃣  GET /api/projects/${project.id}/hitos`);
    const hitos = await axios.get(`http://localhost:5000/api/projects/${project.id}/hitos`);
    console.log(`   ✅ ${hitos.data.length} hitos obtenidos:`);
    hitos.data.forEach(h => {
      console.log(`      • ${h.nombre} [${h.estado}] ${h.porcentaje_peso}%`);
    });
    console.log('');
    
    // 4. GET /api/projects/:id/gastos
    console.log(`4️⃣  GET /api/projects/${project.id}/gastos`);
    const gastos = await axios.get(`http://localhost:5000/api/projects/${project.id}/gastos`);
    console.log(`   ✅ ${gastos.data.length} gastos obtenidos:`);
    gastos.data.forEach(g => {
      console.log(`      • [${g.categoria}] ${g.concepto}: $${g.monto}`);
    });
    console.log('');
    
    // 5. GET /api/projects/:id/dashboard
    console.log(`5️⃣  GET /api/projects/${project.id}/dashboard`);
    const dashboard = await axios.get(`http://localhost:5000/api/projects/${project.id}/dashboard`);
    console.log(`   ✅ Dashboard obtenido`);
    console.log(`   📊 Hitos por estado:`, dashboard.data.hitos);
    console.log(`   💰 Gastos por categoría:`, dashboard.data.gastos);
    console.log(`   ⚠️  Alertas por nivel:`, dashboard.data.alertas);
    console.log('');
    
    console.log('🎉 ¡Todos los endpoints funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
