/* 
==================================================
🔧 PERMITIR NULL EN TODAS LAS COLUMNAS PROBLEMÁTICAS
==================================================
*/

-- Columnas que están NOT NULL sin DEFAULT:
-- 1. id
-- 2. nombre_material
-- 3. unidad
-- 4. cantidad
-- 5. precio_unitario
-- 6. estado
-- 7. detalles
-- 8. observaciones
-- 9. created_at
-- 10. updated_at
-- 11. projects_id
-- 12. insumos_id
-- 13. providers_id
-- 14. users_id

-- ============================================
-- OPCIÓN 1: PERMITIR NULL EN TODAS
-- ============================================

ALTER TABLE cotizaciones ALTER COLUMN id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN nombre_material DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN unidad DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN cantidad DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN precio_unitario DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN estado DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN detalles DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN observaciones DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN updated_at DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN projects_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN insumos_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN providers_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN users_id DROP NOT NULL;

-- ============================================
-- OPCIÓN 2: AGREGAR DEFAULTS (ALTERNATIVA)
-- ============================================
-- Si prefieres DEFAULTS en lugar de NULL, descomenta esto:

-- ALTER TABLE cotizaciones ALTER COLUMN nombre_material SET DEFAULT '';
-- ALTER TABLE cotizaciones ALTER COLUMN unidad SET DEFAULT 'un';
-- ALTER TABLE cotizaciones ALTER COLUMN cantidad SET DEFAULT 1;
-- ALTER TABLE cotizaciones ALTER COLUMN precio_unitario SET DEFAULT 0;
-- ALTER TABLE cotizaciones ALTER COLUMN estado SET DEFAULT 'pendiente';
-- ALTER TABLE cotizaciones ALTER COLUMN detalles SET DEFAULT '';
-- ALTER TABLE cotizaciones ALTER COLUMN observaciones SET DEFAULT '';
-- ALTER TABLE cotizaciones ALTER COLUMN projects_id SET DEFAULT 1;
-- ALTER TABLE cotizaciones ALTER COLUMN insumos_id SET DEFAULT NULL;
-- ALTER TABLE cotizaciones ALTER COLUMN providers_id SET DEFAULT NULL;
-- ALTER TABLE cotizaciones ALTER COLUMN users_id SET DEFAULT 1;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver columnas que AÚN tienen NOT NULL sin DEFAULT
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones' 
AND is_nullable = 'NO' 
AND column_default IS NULL
ORDER BY ordinal_position;

-- Si este query no devuelve nada = ✅ PROBLEMA RESUELTO

-- Ver estructura completa
SELECT 
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
ORDER BY ordinal_position;
