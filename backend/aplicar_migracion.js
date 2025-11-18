const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'rmarcoleta',
  host: 'magallanes.icci-unap.cl',
  database: 'rmarcoleta',
  password: '96ZC2mMo=s@Q',
  port: 5432
});

async function ejecutarMigracion() {
  try {
    console.log('🔄 Conectando a PostgreSQL...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'migrations', '004_gestion_proyectos_final.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Ejecutando migración SQL...');
    console.log('━'.repeat(60));
    
    // Ejecutar la migración
    await pool.query(sql);
    
    console.log('✅ Migración completada exitosamente!');
    console.log('━'.repeat(60));
    
    // Verificar tablas creadas
    const result = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE tablename IN (
        'archivos_proyecto',
        'hitos_proyecto',
        'actividades_proyecto',
        'gastos_proyecto',
        'alertas_proyecto',
        'historial_proyecto'
      )
      ORDER BY tablename;
    `);
    
    console.log('\n📊 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.tablename}`);
    });
    
    // Verificar campos nuevos en projects
    const campos = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'projects'
        AND column_name IN (
          'presupuesto_total',
          'presupuesto_gastado',
          'porcentaje_avance',
          'prioridad',
          'nivel_riesgo'
        )
      ORDER BY column_name;
    `);
    
    console.log('\n📋 Campos nuevos en projects:');
    campos.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });
    
    // Verificar triggers
    const triggers = await pool.query(`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE trigger_name LIKE 'trigger_%'
      ORDER BY trigger_name;
    `);
    
    console.log('\n⚡ Triggers creados:');
    triggers.rows.forEach(row => {
      console.log(`  ✓ ${row.trigger_name}`);
    });
    
    console.log('\n🎉 ¡Sistema listo para gestión de proyectos completa!');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

ejecutarMigracion();
