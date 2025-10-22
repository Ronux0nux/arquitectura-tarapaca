const pool = require('./src/db');

async function inspectCotizacionesTable() {
  try {
    console.log('\n📋 INSPECCIONANDO TABLA COTIZACIONES\n');
    
    // 1. Obtener estructura de columnas
    const columnsResult = await pool.query(`
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
    
    console.log('=== ESTRUCTURA DE COLUMNAS ===');
    columnsResult.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✅ NULL' : '❌ NOT NULL';
      const defaultVal = col.column_default ? `DEFAULT: ${col.column_default}` : 'SIN DEFAULT';
      console.log(`${col.ordinal_position}. ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | ${nullable.padEnd(12)} | ${defaultVal}`);
    });

    // 2. Obtener constraints
    console.log('\n=== CONSTRAINTS ===');
    const constraintsResult = await pool.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'cotizaciones'
    `);
    constraintsResult.rows.forEach(c => {
      console.log(`  - ${c.constraint_name} (${c.constraint_type})`);
    });

    // 3. Obtener secuencias
    console.log('\n=== SECUENCIAS RELACIONADAS ===');
    const sequencesResult = await pool.query(`
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_name LIKE '%cotizaciones%'
    `);
    if (sequencesResult.rows.length > 0) {
      sequencesResult.rows.forEach(s => {
        console.log(`  - ${s.sequence_name}`);
      });
    } else {
      console.log('  ❌ NO HAY SECUENCIAS ENCONTRADAS');
    }

    // 4. Contador de filas
    console.log('\n=== DATOS ACTUALES ===');
    const countResult = await pool.query('SELECT COUNT(*) as total FROM cotizaciones');
    console.log(`  Total de registros: ${countResult.rows[0].total}`);

    console.log('\n✅ INSPECCIÓN COMPLETA\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspectCotizacionesTable();
