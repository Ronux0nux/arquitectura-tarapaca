const pool = require('./src/db');

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cotizaciones' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de tabla cotizaciones:');
    console.log('=====================================');
    res.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
