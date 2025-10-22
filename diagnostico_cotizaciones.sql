-- ============================================
-- 📋 DIAGNÓSTICO TABLA COTIZACIONES
-- ============================================

-- 1️⃣ VER ESTRUCTURA COMPLETA DE LA TABLA
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
ORDER BY ordinal_position;

-- 2️⃣ VER CONSTRAINTS Y PRIMARY KEY
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'cotizaciones';

-- 3️⃣ VER SECUENCIAS DISPONIBLES
SELECT * FROM information_schema.sequences 
WHERE sequence_name LIKE '%cotizaciones%';

-- 4️⃣ VER TOTAL DE REGISTROS
SELECT COUNT(*) as total_registros FROM cotizaciones;

-- 5️⃣ VER PRIMEROS 5 REGISTROS
SELECT * FROM cotizaciones LIMIT 5;

-- ============================================
-- 🔧 SOLUCIONES POSIBLES
-- ============================================

-- OPCIÓN A: Si validez_oferta tiene NOT NULL pero no tiene DEFAULT
-- Agregar DEFAULT a la columna
ALTER TABLE cotizaciones 
ALTER COLUMN validez_oferta SET DEFAULT '30 días';

-- OPCIÓN B: Si hay otras columnas con NOT NULL sin DEFAULT
-- Ejemplo: si users_id, detalles u observaciones tienen problema
ALTER TABLE cotizaciones 
ALTER COLUMN users_id SET DEFAULT 1;

ALTER TABLE cotizaciones 
ALTER COLUMN detalles SET DEFAULT '';

ALTER TABLE cotizaciones 
ALTER COLUMN observaciones SET DEFAULT '';

-- OPCIÓN C: Si necesitas permitir NULL en validez_oferta
-- (Si realmente no es obligatorio)
ALTER TABLE cotizaciones 
ALTER COLUMN validez_oferta DROP NOT NULL;

-- ============================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================

-- Verificar que los cambios se aplicaron
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
ORDER BY ordinal_position;
