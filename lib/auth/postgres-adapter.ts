import { Adapter } from 'next-auth/adapters'
import { createHash } from 'crypto'
import pool from "@/lib/db"

// Helper to hash tokens
const hashToken = (token: string) => {
  return createHash('sha256').update(`${token}${process.env.AUTH_SECRET}`).digest('hex')
}

export function PostgresAdapter(): Adapter {
  return {
    async createUser(user) {
      const result = await pool.query(
        `INSERT INTO users (name, email, email_verified, image, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, name, email, email_verified, image, created_at, updated_at`,
        [user.name, user.email, user.emailVerified, user.image]
      )
      return {
        ...result.rows[0],
        id: result.rows[0].id.toString(),
        emailVerified: result.rows[0].email_verified,
      }
    },

    async getUser(id) {
      const result = await pool.query(
        `SELECT id, name, email, email_verified, image, created_at, updated_at
         FROM users WHERE id = $1`,
        [id]
      )
      if (result.rowCount === 0) return null
      return {
        ...result.rows[0],
        id: result.rows[0].id.toString(),
        emailVerified: result.rows[0].email_verified,
      }
    },

    async getUserByEmail(email) {
      const result = await pool.query(
        `SELECT id, name, email, email_verified, image, password, created_at, updated_at
         FROM users WHERE email = $1`,
        [email]
      )
      if (result.rowCount === 0) return null
      return {
        ...result.rows[0],
        id: result.rows[0].id.toString(),
        emailVerified: result.rows[0].email_verified,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.email_verified, u.image, u.created_at, u.updated_at
         FROM users u
         JOIN accounts a ON u.id = a.user_id
         WHERE a.provider_id = $1 AND a.provider_account_id = $2`,
        [provider, providerAccountId]
      )
      if (result.rowCount === 0) return null
      return {
        ...result.rows[0],
        id: result.rows[0].id.toString(),
        emailVerified: result.rows[0].email_verified,
      }
    },

    async updateUser(user) {
      const result = await pool.query(
        `UPDATE users
         SET name = $1, email = $2, email_verified = $3, image = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING id, name, email, email_verified, image, created_at, updated_at`,
        [user.name, user.email, user.emailVerified, user.image, user.id]
      )
      return {
        ...result.rows[0],
        id: result.rows[0].id.toString(),
        emailVerified: result.rows[0].email_verified,
      }
    },

    async deleteUser(userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId])
    },

    async linkAccount(account) {
      await pool.query(
        `INSERT INTO accounts (
          user_id, provider_id, provider_type, provider_account_id,
          refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          account.userId,
          account.provider,
          account.type,
          account.providerAccountId,
          account.refresh_token,
          account.access_token,
          account.expires_at,
          account.token_type,
          account.scope,
          account.id_token,
          account.session_state,
        ]
      )
      return account
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await pool.query(
        'DELETE FROM accounts WHERE provider_id = $1 AND provider_account_id = $2',
        [provider, providerAccountId]
      )
    },

    async createSession({ sessionToken, userId, expires }) {
      await pool.query(
        `INSERT INTO sessions (user_id, expires, session_token)
         VALUES ($1, $2, $3)`,
        [userId, expires, sessionToken]
      )
      return { sessionToken, userId, expires }
    },

    async getSessionAndUser(sessionToken) {
      const result = await pool.query(
        `SELECT s.user_id, s.expires, s.session_token,
                u.id, u.name, u.email, u.email_verified, u.image, u.created_at, u.updated_at
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.session_token = $1`,
        [sessionToken]
      )
      if (result.rowCount === 0) return null
      const { user_id, expires, session_token, ...user } = result.rows[0]
      return {
        session: { userId: user_id, expires, sessionToken: session_token },
        user: {
          ...user,
          id: user.id.toString(),
          emailVerified: user.email_verified,
        },
      }
    },

    async updateSession({ sessionToken, userId, expires }) {
      const result = await pool.query(
        `UPDATE sessions
         SET expires = $1, user_id = $2
         WHERE session_token = $3
         RETURNING user_id, expires, session_token`,
        [expires, userId, sessionToken]
      )
      if (result.rowCount === 0) return null
      return {
        userId: result.rows[0].user_id,
        expires: result.rows[0].expires,
        sessionToken: result.rows[0].session_token,
      }
    },

    async deleteSession(sessionToken) {
      await pool.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken])
    },

    async createVerificationToken({ identifier, expires, token }) {
      await pool.query(
        `INSERT INTO verification_tokens (identifier, token, expires)
         VALUES ($1, $2, $3)`,
        [identifier, hashToken(token), expires]
      )
      return { identifier, token, expires }
    },

    async useVerificationToken({ identifier, token }) {
      const hashedToken = hashToken(token)
      const result = await pool.query(
        `DELETE FROM verification_tokens
         WHERE identifier = $1 AND token = $2 AND expires > NOW()
         RETURNING identifier, token, expires`,
        [identifier, hashedToken]
      )
      if (result.rowCount === 0) return null
      return {
        identifier: result.rows[0].identifier,
        token: result.rows[0].token,
        expires: result.rows[0].expires,
      }
    },
  }
}