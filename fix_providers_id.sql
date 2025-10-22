-- ===== SCRIPT PARA RECREAR TABLA PROVIDERS CON ID SERIAL CORRECTO =====

-- 1. ELIMINAR LA TABLA ANTIGUA (si existe)
DROP TABLE IF EXISTS providers CASCADE;

-- 2. CREAR SECUENCIA PARA ID
CREATE SEQUENCE IF NOT EXISTS providers_id_seq
  START 1
  INCREMENT 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 3. CREAR TABLA CON ESTRUCTURA CORRECTA
CREATE TABLE providers (
    id INTEGER NOT NULL DEFAULT nextval('providers_id_seq'::regclass),
    nombre VARCHAR(255) NOT NULL,
    rut VARCHAR(50),
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(255),
    sitioweb VARCHAR(255),
    rubros TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT providers_pk PRIMARY KEY (id),
    CONSTRAINT providers_email_unique UNIQUE (email),
    CONSTRAINT providers_rut_unique UNIQUE (rut)
);

-- 4. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX idx_providers_nombre ON providers(nombre);
CREATE INDEX idx_providers_email ON providers(email);
CREATE INDEX idx_providers_rut ON providers(rut);

-- 5. COMENTARIOS
COMMENT ON TABLE providers IS 'Tabla de proveedores de materiales de construcción';
COMMENT ON COLUMN providers.id IS 'ID único del proveedor (auto-incremento)';
COMMENT ON COLUMN providers.rubros IS 'JSON con lista de rubros/categorías';

-- 6. VERIFICAR TABLA CREADA
SELECT * FROM information_schema.columns 
WHERE table_name = 'providers' 
ORDER BY ordinal_position;
