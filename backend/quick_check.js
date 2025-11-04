const pool = require('./src/db');

pool.query('SELECT COUNT(*) as total FROM cotizaciones')
  .then(res => {
    console.log('📊 Total de cotizaciones en BD:', res.rows[0].total);
    
    return pool.query(`
      SELECT projects_id, COUNT(*) as cantidad
      FROM cotizaciones
      GROUP BY projects_id
      ORDER BY projects_id
    `);
  })
  .then(res => {
    console.log('\n📦 Cotizaciones por proyecto:');
    if (res.rows.length === 0) {
      console.log('  ⚠️  NO HAY COTIZACIONES EN LA Base De Datos');
    } else {
      res.rows.forEach(row => {
        console.log(`  Proyecto ${row.projects_id}: ${row.cantidad} cotizaciones`);
      });
    }
  })
  .catch(err => console.error('Error:', err.message))
  .finally(() => process.exit(0));
