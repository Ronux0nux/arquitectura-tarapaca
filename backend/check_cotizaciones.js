const pool = require('./src/db');

async function checkCotizaciones() {
  try {
    // Verificar todas las cotizaciones
    const res = await pool.query(`
      SELECT id, projects_id, nombre_material, cantidad, precio_unitario, estado, created_at 
      FROM cotizaciones 
      ORDER BY created_at DESC 
      LIMIT 20
    `);
    
    console.log('📋 Últimas 20 cotizaciones en BD:');
    console.log('====================================');
    res.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ID: ${row.id}, Proyecto: ${row.projects_id}, Material: ${row.nombre_material}, Estado: ${row.estado}, Fecha: ${row.created_at}`);
    });
    
    console.log('\n📊 Estadísticas:');
    const stats = await pool.query('SELECT COUNT(*) as total, COUNT(DISTINCT projects_id) as proyectos FROM cotizaciones');
    console.log(`  Total cotizaciones: ${stats.rows[0].total}`);
    console.log(`  Proyectos con cotizaciones: ${stats.rows[0].proyectos}`);
    
    // Cotizaciones por proyecto
    const byProject = await pool.query(`
      SELECT projects_id, COUNT(*) as cantidad, COUNT(CASE WHEN estado='pendiente' THEN 1 END) as pendientes
      FROM cotizaciones
      GROUP BY projects_id
      ORDER BY projects_id
    `);
    
    console.log('\n📦 Cotizaciones por proyecto:');
    byProject.rows.forEach(row => {
      console.log(`  Proyecto ${row.projects_id}: ${row.cantidad} total, ${row.pendientes} pendientes`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkCotizaciones();
