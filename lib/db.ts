import { Pool } from "pg"

// Create a new pool for each serverless function invocation
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    // Add connection timeout and max retries
    connectionTimeoutMillis: 5000,
    max: 20,
    idleTimeoutMillis: 30000,
    // Add application name for better debugging
    application_name: process.env.NODE_ENV === 'production' ? 'solar-proposal-prod' : 'solar-proposal-dev'
})

// Add a simple test query to verify connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Export a function to get a new pool instance
export function getPool() {
  return pool;
}

// Export the default pool for backward compatibility
export default pool;