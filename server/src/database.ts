import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required for Postgres-only mode');
}

function createPostgresAdapter(): any {
  const pool = new Pool({ connectionString: DATABASE_URL });
  return {
    isPostgres: true,
    prepare(sqlIn: string) {
      // translate '?' placeholders to $1, $2, ... for pg
      const placeholderCount = (sqlIn.match(/\?/g) || []).length;
      let sql = sqlIn;
      if (placeholderCount > 0) {
        let i = 0;
        sql = sqlIn.replace(/\?/g, () => {
          i += 1;
          return `$${i}`;
        });
      }

      // If INSERT and no RETURNING clause, append RETURNING id so callers expecting lastInsertRowid work
      if (/^\s*INSERT\s+/i.test(sql) && !/\bRETURNING\b/i.test(sql)) {
        sql = `${sql} RETURNING id`;
      }

      return {
        all: async (...params: any[]) => {
          const res = await pool.query(sql, params);
          return res.rows;
        },
        get: async (...params: any[]) => {
          const res = await pool.query(sql, params);
          return res.rows[0];
        },
        run: async (...params: any[]) => {
          const res = await pool.query(sql, params);
          const info: any = { changes: res.rowCount };
          if (res.rows && res.rows[0] && (res.rows[0].id !== undefined)) {
            info.lastInsertRowid = res.rows[0].id;
          }
          return info;
        }
      };
    },
    async transaction(fn: Function) {
      const client = await (pool as any).connect();
      try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        client.release();
        return result;
      } catch (err) {
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
        client.release();
        throw err;
      }
    },
    exec: async (sql: string) => { await pool.query(sql); },
    close: async () => { await pool.end(); },
    initializeDatabase: async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS schools (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            county TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            mission TEXT,
            vision TEXT,
            core_values TEXT,
            founded INTEGER NOT NULL,
            students INTEGER NOT NULL,
            rating REAL NOT NULL,
            image TEXT NOT NULL,
            hero_image TEXT,
            logo TEXT,
            website TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS school_contacts (
            id SERIAL PRIMARY KEY,
            school_id TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS school_features (
            id SERIAL PRIMARY KEY,
            school_id TEXT NOT NULL,
            feature TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS school_leadership (
            id SERIAL PRIMARY KEY,
            school_id TEXT NOT NULL,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            bio TEXT,
            photo TEXT,
            display_order INTEGER DEFAULT 0
          );

          CREATE TABLE IF NOT EXISTS people (
            id SERIAL PRIMARY KEY,
            school_id TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            bio TEXT,
            image TEXT,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'administrator',
            school_id TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS school_gallery (
            id SERIAL PRIMARY KEY,
            school_id TEXT NOT NULL,
            url TEXT NOT NULL,
            caption TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS school_testimonials (
            id SERIAL PRIMARY KEY,
            school_id TEXT NOT NULL,
            author TEXT,
            title TEXT,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } finally {
        client.release();
      }
    }
  };
}
const db = createPostgresAdapter();

// Expose initializeDatabase which may be async for Postgres
export async function initializeDatabase() {
  if (db && typeof db.initializeDatabase === 'function') {
    return await db.initializeDatabase();
  }
  return Promise.resolve();
}

export default db;

