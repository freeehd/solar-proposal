import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    // Add connection timeout and max retries
    connectionTimeoutMillis: 5000,
    max: 20,
    idleTimeoutMillis: 30000
})

// Add a simple test query to verify connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

export default pool