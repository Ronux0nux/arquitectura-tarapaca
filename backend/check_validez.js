const pool = require('./src/db');

async function checkSchema() {
  try {
    console.log('📋 ESQUEMA COMPLETO DE TABLA COTIZACIONES:\n');
    
    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_name = 'cotizaciones'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas en la tabla:');
    result.rows.forEach(col => {
      console.log(`  ${col.ordinal_position}. ${col.column_name}`);
      console.log(`     - Tipo: ${col.data_type}`);
      console.log(`     - Nullable: ${col.is_nullable}`);
      console.log(`     - Default: ${col.column_default || 'NONE'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
