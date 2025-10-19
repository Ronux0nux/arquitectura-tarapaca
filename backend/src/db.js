// filepath: backend/src/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'rmarcoleta',
  host: process.env.DB_HOST || 'magallanes.icci-unap.cl',
  database: process.env.DB_DATABASE || 'rmarcoleta',
  password: process.env.DB_PASSWORD || '96ZC2mMo=s@Q',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;

