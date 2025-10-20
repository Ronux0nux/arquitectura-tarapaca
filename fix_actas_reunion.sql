-- ===== SCRIPT PARA RECREAR TABLA actas_reunion CORRECTAMENTE =====

-- 1. ELIMINAR LA TABLA ANTIGUA (si existe)
DROP TABLE IF EXISTS actas_reunion CASCADE;

-- 2. CREAR SECUENCIA
CREATE SEQUENCE IF NOT EXISTS actas_reunion_seq
  START 1
  INCREMENT 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 3. CREAR TABLA NUEVA CON ESTRUCTURA CORRECTA (snake_case)
CREATE TABLE actas_reunion (
    id INTEGER NOT NULL DEFAULT nextval('actas_reunion_seq'::regclass),
    entidad VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_termino TIME NOT NULL,
    objetivo_reunion VARCHAR(255) NOT NULL,
    temas_tratados VARCHAR(255) NOT NULL,
    acuerdos VARCHAR(255) NOT NULL,
    asistencia TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    projects_id INTEGER NOT NULL,
    users_id INTEGER NOT NULL,
    CONSTRAINT actas_reunion_pk PRIMARY KEY (id),
    CONSTRAINT actas_reunion_projects FOREIGN KEY (projects_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT actas_reunion_users FOREIGN KEY (users_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX idx_actas_reunion_projects_id ON actas_reunion(projects_id);
CREATE INDEX idx_actas_reunion_users_id ON actas_reunion(users_id);
CREATE INDEX idx_actas_reunion_fecha ON actas_reunion(fecha);

-- 5. COMENTARIOS DE LA TABLA
COMMENT ON TABLE actas_reunion IS 'Tabla de actas de reuniones vinculadas a proyectos';
COMMENT ON COLUMN actas_reunion.id IS 'ID único de la acta';
COMMENT ON COLUMN actas_reunion.objetivo_reunion IS 'Objetivo principal de la reunión';
COMMENT ON COLUMN actas_reunion.hora_inicio IS 'Hora de inicio en formato HH:MM:SS';
COMMENT ON COLUMN actas_reunion.hora_termino IS 'Hora de término en formato HH:MM:SS';

-- 6. VERIFICAR TABLA CREADA
SELECT * FROM information_schema.columns 
WHERE table_name = 'actas_reunion' 
ORDER BY ordinal_position;
