const pool = require('./src/db');

async function verificarCotizaciones() {
  try {
    console.log('\n========================================');
    console.log('🔍 VERIFICACIÓN DE COTIZACIONES EN BD');
    console.log('========================================\n');

    // 1. Contar total de cotizaciones
    const countResult = await pool.query('SELECT COUNT(*) as total FROM cotizaciones');
    const totalCotizaciones = countResult.rows[0].total;
    console.log(`📊 Total de cotizaciones en BD: ${totalCotizaciones}`);

    // 2. Contar por proyecto
    const projectResult = await pool.query(`
      SELECT projects_id, COUNT(*) as count, string_agg(nombre_material, ', ') as materiales
      FROM cotizaciones
      GROUP BY projects_id
      ORDER BY projects_id
    `);
    console.log('\n📋 Cotizaciones por proyecto:');
    projectResult.rows.forEach(row => {
      console.log(`   Proyecto ${row.projects_id}: ${row.count} materiales`);
      console.log(`     - ${row.materiales}`);
    });

    // 3. Cotizaciones más recientes
    const recentResult = await pool.query(`
      SELECT 
        id,
        projects_id,
        nombre_material,
        cantidad,
        precio_unitario,
        estado,
        created_at
      FROM cotizaciones
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log('\n🕐 10 Cotizaciones más recientes:');
    recentResult.rows.forEach((row, idx) => {
      const total = row.cantidad * row.precio_unitario;
      console.log(`  ${idx + 1}. ${row.nombre_material}`);
      console.log(`     ID: ${row.id} | Proyecto: ${row.projects_id}`);
      console.log(`     Cantidad: ${row.cantidad} | Precio: $${row.precio_unitario.toLocaleString('es-CL')}`);
      console.log(`     Total: $${total.toLocaleString('es-CL')} | Estado: ${row.estado}`);
      console.log(`     Fecha: ${new Date(row.created_at).toLocaleString('es-CL')}\n`);
    });

    // 4. Resumen por estado
    const statusResult = await pool.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad,
        SUM(cantidad * precio_unitario::numeric) as monto_total
      FROM cotizaciones
      GROUP BY estado
      ORDER BY estado
    `);
    console.log('📈 Resumen por estado:');
    statusResult.rows.forEach(row => {
      console.log(`   ${row.estado.toUpperCase()}: ${row.cantidad} cotizaciones | Total: $${parseFloat(row.monto_total || 0).toLocaleString('es-CL')}`);
    });

    // 5. Monto total
    const totalMoneyResult = await pool.query(`
      SELECT SUM(cantidad * precio_unitario::numeric) as monto_total
      FROM cotizaciones
    `);
    const montoTotal = parseFloat(totalMoneyResult.rows[0].monto_total || 0);
    console.log(`\n💰 MONTO TOTAL EN COTIZACIONES: $${montoTotal.toLocaleString('es-CL')}`);

    console.log('\n========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarCotizaciones();
