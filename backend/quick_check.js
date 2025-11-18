const pool = require('./src/db');

async function verificarDatos() {
  try {
    // Ver datos del primer proyecto
    const proyecto = await pool.query(`
      SELECT 
        id, nombre, estado, 
        presupuesto_total, presupuesto_gastado, porcentaje_avance,
        prioridad, nivel_riesgo
      FROM projects 
      LIMIT 1
    `);
    
    console.log('\n📊 PROYECTO:');
    if (proyecto.rows.length > 0) {
      const p = proyecto.rows[0];
      console.log(`  ID: ${p.id}`);
      console.log(`  Nombre: ${p.nombre}`);
      console.log(`  Estado: ${p.estado}`);
      console.log(`  Presupuesto: $${p.presupuesto_total} / Gastado: $${p.presupuesto_gastado}`);
      console.log(`  Avance: ${p.porcentaje_avance}%`);
      console.log(`  Prioridad: ${p.prioridad} | Riesgo: ${p.nivel_riesgo}`);
      
      // Ver hitos
      const hitos = await pool.query(`
        SELECT nombre, fecha_programada, estado, porcentaje_peso
        FROM hitos_proyecto 
        WHERE proyecto_id = $1
        ORDER BY orden
      `, [p.id]);
      
      console.log(`\n🎯 HITOS (${hitos.rows.length}):`);
      hitos.rows.forEach(h => {
        console.log(`  • ${h.nombre}`);
        console.log(`    Estado: ${h.estado} | Peso: ${h.porcentaje_peso}% | Fecha: ${h.fecha_programada}`);
      });
      
      // Ver gastos
      const gastos = await pool.query(`
        SELECT categoria, concepto, monto
        FROM gastos_proyecto 
        WHERE proyecto_id = $1
        ORDER BY fecha DESC
      `, [p.id]);
      
      console.log(`\n💰 GASTOS (${gastos.rows.length}):`);
      gastos.rows.forEach(g => {
        console.log(`  • [${g.categoria}] ${g.concepto}: $${g.monto}`);
      });
      
      console.log('\n✅ Sistema funcionando correctamente!');
    } else {
      console.log('  ⚠️  No hay proyectos en la base de datos');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit(0);
  }
}

verificarDatos();
