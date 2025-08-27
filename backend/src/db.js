// filepath: e:\arquitectura-tarapaca\arquitectura-tarapaca-2\backend\src\db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'rmarcoleta',
  host: 'magallanes.icci-unap.cl',
  database: 'rmarcoleta',
  password: '96ZC2mMo=s@Q',
  port: 5432,
});

module.exports = pool;

