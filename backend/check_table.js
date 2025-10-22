const pool = require('./src/db');

async function checkTable() {
  try {
    console.log('🔍 Verificando estructura de tabla cotizaciones...\n');
    
    // Obtener estructura
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'cotizaciones'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 COLUMNAS DE TABLA cotizaciones:');
    console.log('─'.repeat(100));
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(25)} | ${row.data_type.padEnd(20)} | Nullable: ${row.is_nullable.padEnd(5)} | Default: ${row.column_default || 'None'}`);
    });
    
    // Verificar secuencias
    const sequences = await pool.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public';
    `);
    
    console.log('\n📊 SECUENCIAS:');
    sequences.rows.forEach(row => {
      console.log(`  - ${row.sequence_name}`);
    });
    
    // Verificar constraints
    const constraints = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'cotizaciones';
    `);
    
    console.log('\n🔐 CONSTRAINTS:');
    constraints.rows.forEach(row => {
      console.log(`  - ${row.constraint_name} (${row.constraint_type})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkTable();
