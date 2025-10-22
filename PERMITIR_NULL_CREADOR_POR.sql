/* 
==================================================
🔧 PERMITIR NULL EN creador_por
==================================================
*/

-- 1️⃣ VER ESTADO ACTUAL
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones' 
AND column_name = 'creador_por';

-- 2️⃣ PERMITIR NULL
ALTER TABLE cotizaciones 
ALTER COLUMN creador_por DROP NOT NULL;

-- 3️⃣ VERIFICAR QUE CAMBIÓ
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones' 
AND column_name = 'creador_por';

-- 4️⃣ VER TODAS LAS COLUMNAS CON PROBLEMA
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones' 
AND is_nullable = 'NO' 
AND column_default IS NULL
ORDER BY ordinal_position;
