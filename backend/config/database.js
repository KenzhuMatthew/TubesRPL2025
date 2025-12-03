// config/database.js - PostgreSQL Connection Pool
const { Pool } = require('pg');

/**
 * PostgreSQL Connection Pool Configuration
 */
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'siap_bimbingan',
  password: process.env.DB_PASSWORD || 'Iphone5see',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: parseInt(process.env.DB_POOL_MAX) || 20, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection fails
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
    return;
  }
  console.log('✅ PostgreSQL connected successfully');
  release();
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err);
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('⚠️ Client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery.apply(client, args);
  };

  // Monkey patch the release method to clear our timeout
  client.release = () => {
    clearTimeout(timeout);
    // Set the methods back to their old values
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
};

/**
 * Health check
 */
const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW() as time, current_database() as database');
    return {
      status: 'healthy',
      timestamp: result.rows[0].time,
      database: result.rows[0].database,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

/**
 * Graceful shutdown
 */
const shutdown = async () => {
  console.log('🔌 Closing PostgreSQL pool...');
  await pool.end();
  console.log('✅ PostgreSQL pool closed');
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', shutdown);

module.exports = {
  query,
  getClient,
  pool,
  healthCheck,
  shutdown,
};