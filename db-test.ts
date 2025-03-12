const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  let client;
  
  try {
    console.log('Database URL:', process.env.DATABASE_URL);
    client = await pool.connect();
    console.log('Successfully connected to the database!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection();