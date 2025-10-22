/* 
==================================================
⚡ COMANDOS RÁPIDOS PARA SOLUCIONAR EL ERROR
==================================================
*/

-- 1️⃣ DIAGNOSTICAR: Ver cuáles columnas tienen el problema
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones' 
  AND is_nullable = 'NO' 
  AND column_default IS NULL;

-- 2️⃣ SOLUCIONAR: Agregar defaults a las columnas problemáticas

-- Si el problema es validez_oferta:
ALTER TABLE cotizaciones ALTER COLUMN validez_oferta SET DEFAULT '30 días';

-- Si el problema es users_id (ID del usuario):
ALTER TABLE cotizaciones ALTER COLUMN users_id SET DEFAULT 1;

-- Si el problema es detalles:
ALTER TABLE cotizaciones ALTER COLUMN detalles SET DEFAULT '';

-- Si el problema es observaciones:
ALTER TABLE cotizaciones ALTER COLUMN observaciones SET DEFAULT '';

-- Si el problema es estado:
ALTER TABLE cotizaciones ALTER COLUMN estado SET DEFAULT 'pendiente';

-- 3️⃣ VERIFICAR: Confirmar que se aplicaron los cambios
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
ORDER BY ordinal_position;

-- 4️⃣ PROBAR: Hacer un INSERT manual para verificar
INSERT INTO cotizaciones (projects_id, nombre_material, cantidad, precio_unitario)
VALUES (3, 'Cemento especial', 1, 5000);

-- 5️⃣ VERIFICAR INSERCIÓN: Ver si quedó guardado
SELECT * FROM cotizaciones ORDER BY id DESC LIMIT 1;

-- 6️⃣ LIMPIAR SI FALLA: Eliminar registros de prueba
DELETE FROM cotizaciones WHERE projects_id = 3 AND nombre_material = 'Cemento especial';
