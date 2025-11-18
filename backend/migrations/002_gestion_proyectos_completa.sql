-- ================================================
-- MIGRACIÓN: Transformar módulo de proyectos básico
-- a sistema profesional de gestión de proyectos
-- ================================================
-- Fecha: 18/11/2025
-- Descripción: Agrega tablas y campos necesarios para
-- gestión completa de proyectos de construcción

BEGIN;

-- ================================================
-- 1. ACTUALIZAR TABLA PROYECTOS (Agregar campos)
-- ================================================

ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS presupuesto_total DECIMAL(15,2) DEFAULT 0;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS presupuesto_gastado DECIMAL(15,2) DEFAULT 0;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS porcentaje_avance INTEGER DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100);
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS fecha_inicio_real DATE;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS fecha_estimada_finalizacion DATE;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja'));
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS nivel_riesgo VARCHAR(20) DEFAULT 'Medio' CHECK (nivel_riesgo IN ('Alto', 'Medio', 'Bajo'));
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS observaciones TEXT;
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS responsable_tecnico UUID REFERENCES usuarios(id);
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(255);
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS cliente_contacto VARCHAR(100);
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP DEFAULT NOW();

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_fecha_termino ON proyectos(fechatermino);
CREATE INDEX IF NOT EXISTS idx_proyectos_subencargado ON proyectos(subencargado);

-- ================================================
-- 2. TABLA: ARCHIVOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS archivos_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  ruta VARCHAR(500) NOT NULL,
  tamaño BIGINT NOT NULL,
  tipo VARCHAR(100),
  categoria VARCHAR(50) DEFAULT 'Otros' CHECK (categoria IN ('Planos', 'Contratos', 'Fotos', 'Documentos', 'Otros')),
  descripcion TEXT,
  subido_por UUID REFERENCES usuarios(id),
  fecha_subida TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  es_publico BOOLEAN DEFAULT false,
  metadata JSONB,
  
  CONSTRAINT archivos_version_positiva CHECK (version > 0),
  CONSTRAINT archivos_tamaño_positivo CHECK (tamaño > 0)
);

CREATE INDEX idx_archivos_proyecto ON archivos_proyecto(proyecto_id);
CREATE INDEX idx_archivos_categoria ON archivos_proyecto(categoria);
CREATE INDEX idx_archivos_fecha ON archivos_proyecto(fecha_subida DESC);

COMMENT ON TABLE archivos_proyecto IS 'Almacena todos los documentos, planos, fotos y archivos relacionados con cada proyecto';
COMMENT ON COLUMN archivos_proyecto.metadata IS 'Información adicional en formato JSON (dimensiones de imagen, número de páginas, etc.)';

-- ================================================
-- 3. TABLA: HITOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS hitos_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_programada DATE NOT NULL,
  fecha_inicio_real DATE,
  fecha_fin_real DATE,
  porcentaje_peso INTEGER DEFAULT 0 CHECK (porcentaje_peso >= 0 AND porcentaje_peso <= 100),
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Completado', 'Atrasado', 'Cancelado')),
  es_critico BOOLEAN DEFAULT false,
  responsable UUID REFERENCES usuarios(id),
  dependencias JSONB DEFAULT '[]',
  orden INTEGER DEFAULT 0,
  notas TEXT,
  creado_por UUID REFERENCES usuarios(id),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT hitos_fechas_validas CHECK (fecha_inicio_real IS NULL OR fecha_fin_real IS NULL OR fecha_inicio_real <= fecha_fin_real)
);

CREATE INDEX idx_hitos_proyecto ON hitos_proyecto(proyecto_id);
CREATE INDEX idx_hitos_estado ON hitos_proyecto(estado);
CREATE INDEX idx_hitos_fecha_programada ON hitos_proyecto(fecha_programada);
CREATE INDEX idx_hitos_orden ON hitos_proyecto(orden);

COMMENT ON TABLE hitos_proyecto IS 'Hitos o milestones importantes del proyecto (ej: Excavación, Fundaciones, Estructura, etc.)';
COMMENT ON COLUMN hitos_proyecto.porcentaje_peso IS 'Qué porcentaje del proyecto total representa este hito';
COMMENT ON COLUMN hitos_proyecto.dependencias IS 'Array JSON de IDs de hitos que deben completarse antes de este';

-- ================================================
-- 4. TABLA: ACTIVIDADES DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS actividades_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  hito_id UUID REFERENCES hitos_proyecto(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  duracion_dias INTEGER GENERATED ALWAYS AS (fecha_fin - fecha_inicio) STORED,
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Completada', 'Bloqueada', 'Cancelada')),
  porcentaje_completado INTEGER DEFAULT 0 CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100),
  asignado_a UUID REFERENCES usuarios(id),
  orden INTEGER DEFAULT 0,
  es_critica BOOLEAN DEFAULT false,
  bloqueadores TEXT,
  creado_por UUID REFERENCES usuarios(id),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT actividades_fechas_validas CHECK (fecha_inicio <= fecha_fin)
);

CREATE INDEX idx_actividades_proyecto ON actividades_proyecto(proyecto_id);
CREATE INDEX idx_actividades_hito ON actividades_proyecto(hito_id);
CREATE INDEX idx_actividades_estado ON actividades_proyecto(estado);
CREATE INDEX idx_actividades_asignado ON actividades_proyecto(asignado_a);

COMMENT ON TABLE actividades_proyecto IS 'Actividades o tareas específicas dentro de cada hito del proyecto';
COMMENT ON COLUMN actividades_proyecto.es_critica IS 'Si es parte del camino crítico (CPM)';

-- ================================================
-- 5. TABLA: GASTOS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS gastos_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  categoria VARCHAR(100) NOT NULL CHECK (categoria IN ('Materiales', 'Mano de Obra', 'Equipos', 'Subcontratos', 'Servicios', 'Otros')),
  subcategoria VARCHAR(100),
  concepto VARCHAR(255) NOT NULL,
  descripcion TEXT,
  monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  proveedor_id UUID REFERENCES proveedores(id),
  orden_compra_id UUID,
  factura_numero VARCHAR(100),
  comprobante_path VARCHAR(500),
  metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta', 'Crédito')),
  aprobado BOOLEAN DEFAULT false,
  aprobado_por UUID REFERENCES usuarios(id),
  fecha_aprobacion TIMESTAMP,
  notas TEXT,
  creado_por UUID REFERENCES usuarios(id),
  fecha_registro TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gastos_proyecto ON gastos_proyecto(proyecto_id);
CREATE INDEX idx_gastos_categoria ON gastos_proyecto(categoria);
CREATE INDEX idx_gastos_fecha ON gastos_proyecto(fecha DESC);
CREATE INDEX idx_gastos_proveedor ON gastos_proyecto(proveedor_id);
CREATE INDEX idx_gastos_aprobado ON gastos_proyecto(aprobado);

COMMENT ON TABLE gastos_proyecto IS 'Registro de todos los gastos del proyecto categorizados';
COMMENT ON COLUMN gastos_proyecto.comprobante_path IS 'Ruta al archivo escaneado de la factura o boleta';

-- ================================================
-- 6. TABLA: ALERTAS DEL PROYECTO
-- ================================================

CREATE TABLE IF NOT EXISTS alertas_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('presupuesto', 'tiempo', 'hito', 'material', 'riesgo', 'documento', 'otro')),
  nivel VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (nivel IN ('info', 'warning', 'critical')),
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  datos_contexto JSONB,
  fecha_generacion TIMESTAMP DEFAULT NOW(),
  fecha_leida TIMESTAMP,
  leida_por UUID REFERENCES usuarios(id),
  resuelta BOOLEAN DEFAULT false,
  fecha_resolucion TIMESTAMP,
  resuelto_por UUID REFERENCES usuarios(id),
  notas_resolucion TEXT,
  activa BOOLEAN GENERATED ALWAYS AS (NOT resuelta AND fecha_generacion > NOW() - INTERVAL '30 days') STORED
);

CREATE INDEX idx_alertas_proyecto ON alertas_proyecto(proyecto_id);
CREATE INDEX idx_alertas_nivel ON alertas_proyecto(nivel);
CREATE INDEX idx_alertas_resuelta ON alertas_proyecto(resuelta);
CREATE INDEX idx_alertas_activa ON alertas_proyecto(activa) WHERE activa = true;
CREATE INDEX idx_alertas_fecha ON alertas_proyecto(fecha_generacion DESC);

COMMENT ON TABLE alertas_proyecto IS 'Sistema de alertas automáticas para notificar situaciones importantes del proyecto';
COMMENT ON COLUMN alertas_proyecto.datos_contexto IS 'Datos adicionales en JSON sobre la alerta (valores, porcentajes, etc.)';

-- ================================================
-- 7. TABLA: HISTORIAL DE CAMBIOS
-- ================================================

CREATE TABLE IF NOT EXISTS historial_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  tipo_cambio VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  campo_modificado VARCHAR(100),
  valor_anterior TEXT,
  valor_nuevo TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  fecha_cambio TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  metadata JSONB
);

CREATE INDEX idx_historial_proyecto ON historial_proyecto(proyecto_id);
CREATE INDEX idx_historial_fecha ON historial_proyecto(fecha_cambio DESC);
CREATE INDEX idx_historial_usuario ON historial_proyecto(usuario_id);

COMMENT ON TABLE historial_proyecto IS 'Auditoría de todos los cambios realizados en el proyecto';

-- ================================================
-- 8. FUNCIONES Y TRIGGERS
-- ================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
DROP TRIGGER IF EXISTS trigger_actualizar_proyectos ON proyectos;
CREATE TRIGGER trigger_actualizar_proyectos
  BEFORE UPDATE ON proyectos
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

-- Función para calcular porcentaje de avance automáticamente
CREATE OR REPLACE FUNCTION calcular_porcentaje_avance()
RETURNS TRIGGER AS $$
DECLARE
  total_peso INTEGER;
  peso_completado INTEGER;
  nuevo_porcentaje INTEGER;
BEGIN
  -- Calcular peso total de hitos del proyecto
  SELECT COALESCE(SUM(porcentaje_peso), 0) INTO total_peso
  FROM hitos_proyecto
  WHERE proyecto_id = NEW.proyecto_id;
  
  -- Calcular peso de hitos completados
  SELECT COALESCE(SUM(porcentaje_peso), 0) INTO peso_completado
  FROM hitos_proyecto
  WHERE proyecto_id = NEW.proyecto_id AND estado = 'Completado';
  
  -- Calcular porcentaje
  IF total_peso > 0 THEN
    nuevo_porcentaje := ROUND((peso_completado::DECIMAL / total_peso::DECIMAL) * 100);
  ELSE
    nuevo_porcentaje := 0;
  END IF;
  
  -- Actualizar el proyecto
  UPDATE proyectos
  SET porcentaje_avance = nuevo_porcentaje
  WHERE id = NEW.proyecto_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recalcular avance cuando cambia un hito
DROP TRIGGER IF EXISTS trigger_recalcular_avance ON hitos_proyecto;
CREATE TRIGGER trigger_recalcular_avance
  AFTER INSERT OR UPDATE OF estado ON hitos_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION calcular_porcentaje_avance();

-- Función para actualizar presupuesto gastado automáticamente
CREATE OR REPLACE FUNCTION actualizar_presupuesto_gastado()
RETURNS TRIGGER AS $$
DECLARE
  total_gastado DECIMAL(15,2);
BEGIN
  -- Calcular total gastado del proyecto
  SELECT COALESCE(SUM(monto), 0) INTO total_gastado
  FROM gastos_proyecto
  WHERE proyecto_id = NEW.proyecto_id AND aprobado = true;
  
  -- Actualizar el proyecto
  UPDATE proyectos
  SET presupuesto_gastado = total_gastado
  WHERE id = NEW.proyecto_id;
  
  -- Generar alerta si excede 85% del presupuesto
  IF total_gastado > (SELECT presupuesto_total * 0.85 FROM proyectos WHERE id = NEW.proyecto_id) THEN
    INSERT INTO alertas_proyecto (proyecto_id, tipo, nivel, titulo, mensaje)
    VALUES (
      NEW.proyecto_id,
      'presupuesto',
      'warning',
      'Presupuesto al 85%',
      'El proyecto ha gastado más del 85% del presupuesto total. Se recomienda revisar los gastos proyectados.'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar presupuesto cuando se aprueba un gasto
DROP TRIGGER IF EXISTS trigger_actualizar_presupuesto ON gastos_proyecto;
CREATE TRIGGER trigger_actualizar_presupuesto
  AFTER INSERT OR UPDATE OF monto, aprobado ON gastos_proyecto
  FOR EACH ROW
  WHEN (NEW.aprobado = true)
  EXECUTE FUNCTION actualizar_presupuesto_gastado();

-- Función para verificar hitos atrasados
CREATE OR REPLACE FUNCTION verificar_hitos_atrasados()
RETURNS void AS $$
BEGIN
  -- Actualizar estado de hitos a "Atrasado"
  UPDATE hitos_proyecto
  SET estado = 'Atrasado'
  WHERE fecha_programada < CURRENT_DATE
    AND estado IN ('Pendiente', 'En Progreso')
    AND NOT EXISTS (
      SELECT 1 FROM alertas_proyecto a
      WHERE a.proyecto_id = hitos_proyecto.proyecto_id
        AND a.tipo = 'hito'
        AND a.resuelta = false
        AND a.datos_contexto->>'hito_id' = hitos_proyecto.id::text
    );
  
  -- Generar alertas para hitos atrasados
  INSERT INTO alertas_proyecto (proyecto_id, tipo, nivel, titulo, mensaje, datos_contexto)
  SELECT 
    h.proyecto_id,
    'hito',
    'warning',
    'Hito atrasado: ' || h.nombre,
    'El hito "' || h.nombre || '" programado para ' || h.fecha_programada || ' está atrasado.',
    jsonb_build_object('hito_id', h.id, 'dias_atraso', CURRENT_DATE - h.fecha_programada)
  FROM hitos_proyecto h
  WHERE h.estado = 'Atrasado'
    AND NOT EXISTS (
      SELECT 1 FROM alertas_proyecto a
      WHERE a.proyecto_id = h.proyecto_id
        AND a.tipo = 'hito'
        AND a.resuelta = false
        AND a.datos_contexto->>'hito_id' = h.id::text
    );
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 9. VISTAS ÚTILES
-- ================================================

-- Vista: Resumen de proyectos
CREATE OR REPLACE VIEW vista_resumen_proyectos AS
SELECT 
  p.id,
  p.nombre,
  p.codigo,
  p.estado,
  p.porcentaje_avance,
  p.presupuesto_total,
  p.presupuesto_gastado,
  ROUND((p.presupuesto_gastado / NULLIF(p.presupuesto_total, 0)) * 100, 2) as porcentaje_gastado,
  p.fechainicio,
  p.fechatermino,
  p.fechainicio - CURRENT_DATE as dias_transcurridos,
  p.fechatermino - CURRENT_DATE as dias_restantes,
  CASE 
    WHEN p.fechatermino < CURRENT_DATE AND p.estado != 'Finalizado' THEN 'Atrasado'
    WHEN p.fechatermino - CURRENT_DATE <= 15 THEN 'Urgente'
    ELSE 'Normal'
  END as urgencia,
  u.nombre as coordinador_nombre,
  COUNT(DISTINCT h.id) as total_hitos,
  COUNT(DISTINCT CASE WHEN h.estado = 'Completado' THEN h.id END) as hitos_completados,
  COUNT(DISTINCT a.id) as total_alertas_activas,
  COUNT(DISTINCT arc.id) as total_archivos
FROM proyectos p
LEFT JOIN usuarios u ON p.subencargado = u.id
LEFT JOIN hitos_proyecto h ON p.id = h.proyecto_id
LEFT JOIN alertas_proyecto a ON p.id = a.proyecto_id AND a.activa = true
LEFT JOIN archivos_proyecto arc ON p.id = arc.proyecto_id
GROUP BY p.id, u.nombre;

COMMENT ON VIEW vista_resumen_proyectos IS 'Resumen completo de todos los proyectos con métricas calculadas';

-- Vista: Dashboard del proyecto
CREATE OR REPLACE VIEW vista_dashboard_proyecto AS
SELECT 
  p.id as proyecto_id,
  p.nombre,
  p.estado,
  p.porcentaje_avance,
  p.presupuesto_total,
  p.presupuesto_gastado,
  p.presupuesto_total - p.presupuesto_gastado as presupuesto_disponible,
  COUNT(DISTINCT h.id) FILTER (WHERE h.estado = 'Completado') as hitos_completados,
  COUNT(DISTINCT h.id) FILTER (WHERE h.estado != 'Completado') as hitos_pendientes,
  COUNT(DISTINCT arc.id) as total_archivos,
  COUNT(DISTINCT a.id) FILTER (WHERE a.nivel = 'critical') as alertas_criticas,
  COUNT(DISTINCT a.id) FILTER (WHERE a.nivel = 'warning') as alertas_advertencia,
  p.fechatermino - CURRENT_DATE as dias_restantes
FROM proyectos p
LEFT JOIN hitos_proyecto h ON p.id = h.proyecto_id
LEFT JOIN archivos_proyecto arc ON p.id = arc.proyecto_id
LEFT JOIN alertas_proyecto a ON p.id = a.proyecto_id AND a.activa = true
GROUP BY p.id;

COMMENT ON VIEW vista_dashboard_proyecto IS 'Datos para el dashboard de cada proyecto';

-- ================================================
-- 10. DATOS DE EJEMPLO (Opcional - Solo desarrollo)
-- ================================================

-- Insertar hitos de ejemplo para proyectos existentes
-- (Descomenta si quieres datos de prueba)

/*
INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_programada, porcentaje_peso, orden, es_critico)
SELECT 
  id,
  'Excavación y Movimiento de Tierras',
  'Preparación del terreno y excavación para fundaciones',
  fechainicio + INTERVAL '7 days',
  15,
  1,
  true
FROM proyectos
WHERE NOT EXISTS (SELECT 1 FROM hitos_proyecto WHERE proyecto_id = proyectos.id)
LIMIT 1;

INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, fecha_programada, porcentaje_peso, orden, es_critico)
SELECT 
  id,
  'Fundaciones',
  'Construcción de cimientos y zapatas',
  fechainicio + INTERVAL '21 days',
  20,
  2,
  true
FROM proyectos
WHERE NOT EXISTS (SELECT 1 FROM hitos_proyecto WHERE proyecto_id = proyectos.id LIMIT 1)
LIMIT 1;
*/

COMMIT;

-- ================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ================================================

-- Verificar que todas las tablas se crearon
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN (
  'proyectos',
  'archivos_proyecto',
  'hitos_proyecto',
  'actividades_proyecto',
  'gastos_proyecto',
  'alertas_proyecto',
  'historial_proyecto'
)
ORDER BY tablename;

-- Mostrar resumen
SELECT 'Migración completada exitosamente' as status;
