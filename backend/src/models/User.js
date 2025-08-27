// Modelo User usando PostgreSQL
const pool = require('../db');

module.exports = {
  create: async (data) => {
    const res = await pool.query(
      'INSERT INTO users (nombre, email, rol, password, proyectos) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.nombre, data.email, data.rol || 'usuario', data.password, JSON.stringify(data.proyectos || [])]
    );
    return res.rows[0];
  },
  findAll: async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows.map(u => ({ ...u, proyectos: JSON.parse(u.proyectos || '[]') }));
  },
  findById: async (id) => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const u = res.rows[0];
    if (!u) return null;
    u.proyectos = JSON.parse(u.proyectos || '[]');
    return u;
  },
  update: async (id, data) => {
    await pool.query(
      'UPDATE users SET nombre = $1, email = $2, rol = $3, password = $4, proyectos = $5 WHERE id = $6',
      [data.nombre, data.email, data.rol, data.password, JSON.stringify(data.proyectos || []), id]
    );
    return await module.exports.findById(id);
  },
  delete: async (id) => {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  },
};
