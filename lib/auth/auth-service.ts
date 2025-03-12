import bcrypt from 'bcryptjs'
import pool from "@/lib/db"

export async function getUserByEmail(email: string) {
  try {
    const result = await pool.query(
      `SELECT id, name, email, password, email_verified, image
       FROM users
       WHERE email = $1`,
      [email]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw new Error('Failed to get user')
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  try {
    // Add logging for debugging
    console.log('Verifying password:');
    console.log('Plain password length:', plainPassword.length);
    console.log('Hashed password:', hashedPassword);
    
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Bcrypt compare result:', result);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}
export async function createAuthTables() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        email_verified TIMESTAMP,
        password VARCHAR(255),
        image VARCHAR(255),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `)
    
    // Create accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider_id VARCHAR(255) NOT NULL,
        provider_type VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type VARCHAR(255),
        scope VARCHAR(255),
        id_token TEXT,
        session_state VARCHAR(255),
        UNIQUE(provider_id, provider_account_id)
      )
    `)
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL
      )
    `)
    
    // Create verification tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `)
    
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating auth tables:', error)
    throw error
  } finally {
    client.release()
  }
}