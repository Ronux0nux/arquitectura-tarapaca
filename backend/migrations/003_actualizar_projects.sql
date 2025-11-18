-- ================================================
-- MIGRACIÓN: Actualizar tabla projects existente
-- y agregar nuevas tablas para gestión completa
-- ================================================

BEGIN;

-- ================================================
-- 1. ACTUALIZAR TABLA PROJECTS (Agregar campos)
-- ================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS presupuesto_total DECIMAL(15,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS presupuesto_gastado DECIMAL(15,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS fecha_inicio_real DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS fecha_estimada_finalizacion DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS nivel_riesgo VARCHAR(20) DEFAULT 'Medio' CHECK (nivel_riesgo IN ('Alto', 'Medio', 'Bajo'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS responsable_tecnico UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cliente_contacto VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW();

-- Índices
CREATE INDEX IF NOT EXISTS idx_projects_estado ON projects(estado);
CREATE INDEX IF NOT EXISTS idx_projects_subencargado ON projects(subencargado);

-- ================================================
-- 2. TABLA: ARCHIVOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS archivos_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  ruta VARCHAR(500) NOT NULL,
  tamaño BIGINT NOT NULL,
  tipo VARCHAR(100),
  categoria VARCHAR(50) DEFAULT 'Otros' CHECK (categoria IN ('Planos', 'Contratos', 'Fotos', 'Documentos', 'Otros')),
  descripcion TEXT,
  subido_por UUID,
  fecha_subida TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  es_publico BOOLEAN DEFAULT false,
  metadata JSONB,
  
  CONSTRAINT archivos_version_positiva CHECK (version > 0),
  CONSTRAINT archivos_tamaño_positivo CHECK (tamaño > 0)
);

CREATE INDEX IF NOT EXISTS idx_archivos_proyecto ON archivos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_archivos_categoria ON archivos_proyecto(categoria);

-- ================================================
-- 3. TABLA: HITOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS hitos_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_programada DATE NOT NULL,
  fecha_inicio_real DATE,
  fecha_fin_real DATE,
  porcentaje_peso INTEGER DEFAULT 0 CHECK (porcentaje_peso >= 0 AND porcentaje_peso <= 100),
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Completado', 'Atrasado', 'Cancelado')),
  es_critico BOOLEAN DEFAULT false,
  responsable UUID,
  dependencias JSONB DEFAULT '[]',
  orden INTEGER DEFAULT 0,
  notas TEXT,
  creado_por UUID,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hitos_proyecto ON hitos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_hitos_estado ON hitos_proyecto(estado);

-- ================================================
-- 4. TABLA: ACTIVIDADES DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS actividades_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hito_id UUID REFERENCES hitos_proyecto(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Completada', 'Bloqueada', 'Cancelada')),
  porcentaje_completado INTEGER DEFAULT 0 CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100),
  asignado_a UUID,
  orden INTEGER DEFAULT 0,
  es_critica BOOLEAN DEFAULT false,
  bloqueadores TEXT,
  creado_por UUID,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT actividades_fechas_validas CHECK (fecha_inicio <= fecha_fin)
);

CREATE INDEX IF NOT EXISTS idx_actividades_proyecto ON actividades_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_actividades_hito ON actividades_proyecto(hito_id);

-- ================================================
-- 5. TABLA: GASTOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS gastos_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL CHECK (categoria IN ('Materiales', 'Mano de Obra', 'Equipos', 'Subcontratos', 'Servicios', 'Otros')),
  subcategoria VARCHAR(100),
  concepto VARCHAR(255) NOT NULL,
  descripcion TEXT,
  monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  proveedor_id UUID,
  orden_compra_id UUID,
  factura_numero VARCHAR(100),
  comprobante_path VARCHAR(500),
  metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta', 'Crédito')),
  aprobado BOOLEAN DEFAULT false,
  aprobado_por UUID,
  fecha_aprobacion TIMESTAMP,
  notas TEXT,
  creado_por UUID,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_proyecto ON gastos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos_proyecto(categoria);

-- ================================================
-- 6. TABLA: ALERTAS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS alertas_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('presupuesto', 'tiempo', 'hito', 'material', 'riesgo', 'documento', 'otro')),
  nivel VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (nivel IN ('info', 'warning', 'critical')),
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  datos_contexto JSONB,
  fecha_generacion TIMESTAMP DEFAULT NOW(),
  fecha_leida TIMESTAMP,
  leida_por UUID,
  resuelta BOOLEAN DEFAULT false,
  fecha_resolucion TIMESTAMP,
  resuelto_por UUID,
  notas_resolucion TEXT
);

CREATE INDEX IF NOT EXISTS idx_alertas_proyecto ON alertas_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_alertas_resuelta ON alertas_proyecto(resuelta);

-- ================================================
-- 7. FUNCIONES Y TRIGGERS
-- ================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_actualizar_projects ON projects;
CREATE TRIGGER trigger_actualizar_projects
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_actualizar_hitos ON hitos_proyecto;
CREATE TRIGGER trigger_actualizar_hitos
  BEFORE UPDATE ON hitos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_actualizar_actividades ON actividades_proyecto;
CREATE TRIGGER trigger_actualizar_actividades
  BEFORE UPDATE ON actividades_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_actualizar_gastos ON gastos_proyecto;
CREATE TRIGGER trigger_actualizar_gastos
  BEFORE UPDATE ON gastos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- ================================================
-- 8. DATOS DE EJEMPLO
-- ================================================

-- Insertar 2-3 hitos de ejemplo para proyectos existentes
INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_programada, porcentaje_peso, orden, es_critico)
SELECT 
  id,
  'Excavación y Movimiento de Tierras',
  'Preparación del terreno y excavación para fundaciones',
  fechainicio + INTERVAL '7 days',
  15,
  1,
  true
FROM projects
WHERE EXISTS (SELECT 1 FROM projects LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_programada, porcentaje_peso, orden, es_critico)
SELECT 
  id,
  'Fundaciones',
  'Construcción de cimientos y zapatas',
  fechainicio + INTERVAL '21 days',
  20,
  2,
  true
FROM projects
WHERE EXISTS (SELECT 1 FROM projects LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_programada, porcentaje_peso, orden, es_critico)
SELECT 
  id,
  'Estructura',
  'Levantamiento de estructura principal',
  fechainicio + INTERVAL '45 days',
  30,
  3,
  true
FROM projects
WHERE EXISTS (SELECT 1 FROM projects LIMIT 1)
ON CONFLICT DO NOTHING;

COMMIT;

SELECT 'Migración completada exitosamente' as status;
