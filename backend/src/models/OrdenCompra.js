// Modelo OrdenCompra usando better-sqlite3
const Database = require('better-sqlite3');
const db = new Database('data.db');

// Crear tabla si no existe
db.exec(`CREATE TABLE IF NOT EXISTS ordenes_compra (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proyectoId INTEGER,
  cotizacionId INTEGER,
  numeroOrden TEXT UNIQUE,
  comprador TEXT NOT NULL,
  fecha TEXT DEFAULT (datetime('now')),
  proveedor TEXT NOT NULL,
  proveedorId INTEGER,
  estado TEXT DEFAULT 'Pendiente',
  moneda TEXT DEFAULT 'CLP',
  conversionRate REAL DEFAULT 1,
  montoBruto REAL NOT NULL,
  descuento REAL DEFAULT 0,
  impuestos REAL DEFAULT 0,
  montoNeto REAL,
  tipoOrden TEXT DEFAULT 'Materiales',
  fechaEntregaEstimada TEXT,
  fechaEntregaReal TEXT,
  observaciones TEXT,
  condicionesPago TEXT,
  creadoPor INTEGER,
  creadoEn TEXT DEFAULT (datetime('now')),
  actualizadoEn TEXT DEFAULT (datetime('now'))
)`);

module.exports = {
  create: (data) => {
    const montoNeto = (data.montoBruto || 0) - (data.descuento || 0) + (data.impuestos || 0);
    const stmt = db.prepare(`INSERT INTO ordenes_compra (proyectoId, cotizacionId, numeroOrden, comprador, proveedor, proveedorId, estado, moneda, conversionRate, montoBruto, descuento, impuestos, montoNeto, tipoOrden, fechaEntregaEstimada, fechaEntregaReal, observaciones, condicionesPago, creadoPor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.proyectoId, data.cotizacionId, data.numeroOrden, data.comprador, data.proveedor, data.proveedorId, data.estado || 'Pendiente', data.moneda || 'CLP', data.conversionRate || 1, data.montoBruto, data.descuento || 0, data.impuestos || 0, montoNeto, data.tipoOrden || 'Materiales', data.fechaEntregaEstimada, data.fechaEntregaReal, data.observaciones, data.condicionesPago, data.creadoPor);
  },
  findAll: () => {
    const stmt = db.prepare(`SELECT * FROM ordenes_compra`);
    return stmt.all();
  },
  findById: (id) => {
    const stmt = db.prepare(`SELECT * FROM ordenes_compra WHERE id = ?`);
    return stmt.get(id);
  },
  // Agrega más métodos según necesidad
};
