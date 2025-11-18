-- ================================================
-- MIGRACIÓN: Gestión Completa de Proyectos
-- Tabla base: projects (id INTEGER)
-- ================================================

BEGIN;

-- ================================================
-- 1. ACTUALIZAR TABLA PROJECTS EXISTENTE
-- ================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS presupuesto_total DECIMAL(15,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS presupuesto_gastado DECIMAL(15,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS fecha_inicio_real DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS fecha_estimada_finalizacion DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS nivel_riesgo VARCHAR(20) DEFAULT 'Medio' CHECK (nivel_riesgo IN ('Alto', 'Medio', 'Bajo'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS responsable_tecnico VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cliente_contacto VARCHAR(100);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_estado ON projects(estado);
CREATE INDEX IF NOT EXISTS idx_projects_subencargado ON projects(subencargado);

-- ================================================
-- 2. TABLA: ARCHIVOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS archivos_proyecto (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  ruta VARCHAR(500) NOT NULL,
  tamanio BIGINT NOT NULL,
  tipo VARCHAR(100),
  categoria VARCHAR(50) DEFAULT 'Otros' CHECK (categoria IN ('Planos', 'Contratos', 'Fotos', 'Documentos', 'Otros')),
  descripcion TEXT,
  subido_por INTEGER,
  fecha_subida TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  es_publico BOOLEAN DEFAULT false,
  
  CONSTRAINT archivos_version_positiva CHECK (version > 0),
  CONSTRAINT archivos_tamanio_positivo CHECK (tamanio > 0)
);

CREATE INDEX IF NOT EXISTS idx_archivos_proyecto ON archivos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_archivos_categoria ON archivos_proyecto(categoria);

-- ================================================
-- 3. TABLA: HITOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS hitos_proyecto (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_programada DATE NOT NULL,
  fecha_inicio_real DATE,
  fecha_fin_real DATE,
  porcentaje_peso INTEGER DEFAULT 0 CHECK (porcentaje_peso >= 0 AND porcentaje_peso <= 100),
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Completado', 'Atrasado', 'Cancelado')),
  es_critico BOOLEAN DEFAULT false,
  responsable INTEGER,
  orden INTEGER DEFAULT 0,
  notas TEXT,
  creado_por INTEGER,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hitos_proyecto ON hitos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_hitos_estado ON hitos_proyecto(estado);

-- ================================================
-- 4. TABLA: ACTIVIDADES DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS actividades_proyecto (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hito_id INTEGER REFERENCES hitos_proyecto(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Completada', 'Bloqueada', 'Cancelada')),
  porcentaje_completado INTEGER DEFAULT 0 CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100),
  asignado_a INTEGER,
  orden INTEGER DEFAULT 0,
  es_critica BOOLEAN DEFAULT false,
  bloqueadores TEXT,
  creado_por INTEGER,
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
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL CHECK (categoria IN ('Materiales', 'Mano de Obra', 'Equipos', 'Subcontratos', 'Servicios', 'Otros')),
  subcategoria VARCHAR(100),
  concepto VARCHAR(255) NOT NULL,
  descripcion TEXT,
  monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  proveedor_id INTEGER,
  factura_numero VARCHAR(100),
  comprobante_path VARCHAR(500),
  metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta', 'Crédito')),
  aprobado BOOLEAN DEFAULT false,
  aprobado_por INTEGER,
  fecha_aprobacion TIMESTAMP,
  notas TEXT,
  creado_por INTEGER,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_proyecto ON gastos_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos_proyecto(categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos_proyecto(fecha);

-- ================================================
-- 6. TABLA: ALERTAS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS alertas_proyecto (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('presupuesto', 'tiempo', 'hito', 'material', 'riesgo', 'documento', 'otro')),
  nivel VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (nivel IN ('info', 'warning', 'critical')),
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_generacion TIMESTAMP DEFAULT NOW(),
  fecha_leida TIMESTAMP,
  leida_por INTEGER,
  resuelta BOOLEAN DEFAULT false,
  fecha_resolucion TIMESTAMP,
  resuelto_por INTEGER,
  notas_resolucion TEXT
);

CREATE INDEX IF NOT EXISTS idx_alertas_proyecto ON alertas_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_alertas_resuelta ON alertas_proyecto(resuelta);
CREATE INDEX IF NOT EXISTS idx_alertas_nivel ON alertas_proyecto(nivel);

-- ================================================
-- 7. TABLA: HISTORIAL DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS historial_proyecto (
  id SERIAL PRIMARY KEY,
  proyecto_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  usuario_id INTEGER,
  accion VARCHAR(100) NOT NULL,
  entidad VARCHAR(50) NOT NULL,
  entidad_id INTEGER,
  descripcion TEXT NOT NULL,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  fecha TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_proyecto ON historial_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_proyecto(fecha);

-- ================================================
-- 8. FUNCIONES Y TRIGGERS
-- ================================================

-- Función: Actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: Calcular porcentaje de avance del proyecto
CREATE OR REPLACE FUNCTION calcular_porcentaje_avance()
RETURNS TRIGGER AS $$
DECLARE
  total_peso INTEGER;
  avance_ponderado DECIMAL;
BEGIN
  SELECT 
    COALESCE(SUM(porcentaje_peso), 0),
    COALESCE(SUM(
      CASE 
        WHEN estado = 'Completado' THEN porcentaje_peso
        ELSE 0
      END
    ), 0)
  INTO total_peso, avance_ponderado
  FROM hitos_proyecto
  WHERE proyecto_id = NEW.proyecto_id;
  
  IF total_peso > 0 THEN
    UPDATE projects 
    SET porcentaje_avance = ROUND((avance_ponderado::DECIMAL / total_peso) * 100)
    WHERE id = NEW.proyecto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: Actualizar presupuesto gastado
CREATE OR REPLACE FUNCTION actualizar_presupuesto_gastado()
RETURNS TRIGGER AS $$
DECLARE
  total_gastado DECIMAL;
BEGIN
  SELECT COALESCE(SUM(monto), 0)
  INTO total_gastado
  FROM gastos_proyecto
  WHERE proyecto_id = COALESCE(NEW.proyecto_id, OLD.proyecto_id)
    AND aprobado = true;
  
  UPDATE projects
  SET presupuesto_gastado = total_gastado
  WHERE id = COALESCE(NEW.proyecto_id, OLD.proyecto_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Función: Verificar hitos atrasados y generar alertas
CREATE OR REPLACE FUNCTION verificar_hitos_atrasados()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado != 'Completado' AND NEW.fecha_programada < CURRENT_DATE THEN
    INSERT INTO alertas_proyecto (proyecto_id, tipo, nivel, titulo, mensaje)
    VALUES (
      NEW.proyecto_id,
      'hito',
      'warning',
      'Hito Atrasado',
      'El hito "' || NEW.nombre || '" está atrasado. Fecha programada: ' || NEW.fecha_programada
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: Verificar presupuesto excedido
CREATE OR REPLACE FUNCTION verificar_presupuesto()
RETURNS TRIGGER AS $$
DECLARE
  proyecto RECORD;
BEGIN
  SELECT presupuesto_total, presupuesto_gastado
  INTO proyecto
  FROM projects
  WHERE id = NEW.proyecto_id;
  
  IF proyecto.presupuesto_total > 0 THEN
    IF proyecto.presupuesto_gastado > proyecto.presupuesto_total * 0.9 THEN
      INSERT INTO alertas_proyecto (proyecto_id, tipo, nivel, titulo, mensaje)
      VALUES (
        NEW.proyecto_id,
        'presupuesto',
        CASE 
          WHEN proyecto.presupuesto_gastado >= proyecto.presupuesto_total THEN 'critical'
          ELSE 'warning'
        END,
        'Alerta de Presupuesto',
        'Presupuesto gastado: $' || proyecto.presupuesto_gastado || ' de $' || proyecto.presupuesto_total
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para hitos
DROP TRIGGER IF EXISTS trigger_actualizar_hitos ON hitos_proyecto;
CREATE TRIGGER trigger_actualizar_hitos
  BEFORE UPDATE ON hitos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_calcular_avance ON hitos_proyecto;
CREATE TRIGGER trigger_calcular_avance
  AFTER INSERT OR UPDATE ON hitos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION calcular_porcentaje_avance();

DROP TRIGGER IF EXISTS trigger_verificar_atrasados ON hitos_proyecto;
CREATE TRIGGER trigger_verificar_atrasados
  AFTER INSERT OR UPDATE ON hitos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION verificar_hitos_atrasados();

-- Triggers para gastos
DROP TRIGGER IF EXISTS trigger_actualizar_gastos ON gastos_proyecto;
CREATE TRIGGER trigger_actualizar_gastos
  BEFORE UPDATE ON gastos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_actualizar_presupuesto ON gastos_proyecto;
CREATE TRIGGER trigger_actualizar_presupuesto
  AFTER INSERT OR UPDATE OR DELETE ON gastos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_presupuesto_gastado();

DROP TRIGGER IF EXISTS trigger_verificar_presupuesto ON gastos_proyecto;
CREATE TRIGGER trigger_verificar_presupuesto
  AFTER INSERT OR UPDATE ON gastos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION verificar_presupuesto();

-- Triggers para actividades
DROP TRIGGER IF EXISTS trigger_actualizar_actividades ON actividades_proyecto;
CREATE TRIGGER trigger_actualizar_actividades
  BEFORE UPDATE ON actividades_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- ================================================
-- 9. VISTA: Resumen de Proyectos
-- ================================================

CREATE OR REPLACE VIEW vista_resumen_proyectos AS
SELECT 
  p.id,
  p.nombre,
  p.codigo,
  p.estado,
  p.porcentaje_avance,
  p.presupuesto_total,
  p.presupuesto_gastado,
  p.nivel_riesgo,
  p.prioridad,
  COUNT(DISTINCT h.id) as total_hitos,
  COUNT(DISTINCT CASE WHEN h.estado = 'Completado' THEN h.id END) as hitos_completados,
  COUNT(DISTINCT g.id) as total_gastos,
  COUNT(DISTINCT a.id) as total_archivos,
  COUNT(DISTINCT al.id) FILTER (WHERE al.resuelta = false) as alertas_activas
FROM projects p
LEFT JOIN hitos_proyecto h ON p.id = h.proyecto_id
LEFT JOIN gastos_proyecto g ON p.id = g.proyecto_id AND g.aprobado = true
LEFT JOIN archivos_proyecto a ON p.id = a.proyecto_id
LEFT JOIN alertas_proyecto al ON p.id = al.proyecto_id
GROUP BY p.id;

-- ================================================
-- 10. DATOS DE EJEMPLO
-- ================================================

-- Insertar datos de ejemplo SOLO si existen proyectos
DO $$
DECLARE
  primer_proyecto_id INTEGER;
BEGIN
  -- Obtener el primer proyecto
  SELECT id INTO primer_proyecto_id FROM projects LIMIT 1;
  
  IF primer_proyecto_id IS NOT NULL THEN
    -- Actualizar el proyecto con datos de ejemplo
    UPDATE projects 
    SET 
      presupuesto_total = 50000000,
      prioridad = 'Alta',
      nivel_riesgo = 'Medio',
      cliente_nombre = 'Ejemplo Cliente',
      responsable_tecnico = 'Ingeniero Responsable'
    WHERE id = primer_proyecto_id;
    
    -- Insertar 3 hitos de ejemplo
    INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_programada, porcentaje_peso, orden, es_critico, estado)
    VALUES 
      (primer_proyecto_id, 'Excavación y Movimiento de Tierras', 'Preparación del terreno y excavación para fundaciones', CURRENT_DATE + INTERVAL '7 days', 15, 1, true, 'Completado'),
      (primer_proyecto_id, 'Fundaciones', 'Construcción de cimientos y zapatas', CURRENT_DATE + INTERVAL '21 days', 20, 2, true, 'En Progreso'),
      (primer_proyecto_id, 'Estructura', 'Levantamiento de estructura principal', CURRENT_DATE + INTERVAL '45 days', 30, 3, true, 'Pendiente');
    
    -- Insertar gastos de ejemplo
    INSERT INTO gastos_proyecto (proyecto_id, categoria, concepto, descripcion, monto, aprobado)
    VALUES 
      (primer_proyecto_id, 'Materiales', 'Cemento', 'Cemento para fundaciones', 1500000, true),
      (primer_proyecto_id, 'Mano de Obra', 'Excavación', 'Pago cuadrilla excavación', 2000000, true),
      (primer_proyecto_id, 'Equipos', 'Retroexcavadora', 'Arriendo retroexcavadora 3 días', 450000, true);
    
    RAISE NOTICE 'Datos de ejemplo insertados para proyecto ID %', primer_proyecto_id;
  ELSE
    RAISE NOTICE 'No hay proyectos en la base de datos. No se insertaron datos de ejemplo.';
  END IF;
END $$;

COMMIT;

SELECT 'Migración completada exitosamente' as status;
