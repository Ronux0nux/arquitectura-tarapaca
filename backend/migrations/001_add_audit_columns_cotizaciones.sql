-- Migration: agregar columnas de auditoría a la tabla cotizaciones
-- Ejecutar manualmente en la base de datos PostgreSQL cuando estés listo.

ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS created_by bigint;

ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS updated_by bigint;

ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS approved_by bigint;

ALTER TABLE cotizaciones
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Opcional: indices para búsquedas por approved_by o created_by
CREATE INDEX IF NOT EXISTS idx_cotizaciones_created_by ON cotizaciones(created_by);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_approved_by ON cotizaciones(approved_by);
