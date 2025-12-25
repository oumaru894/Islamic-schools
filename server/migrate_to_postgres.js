/*
Simple migration script: copy SQLite data into Postgres using DATABASE_URL env var.
Usage: DATABASE_URL=postgres://... node migrate_to_postgres.js

Notes:
- This script does a best-effort transfer for the main tables.
- Run in a safe environment and backup your SQLite DB before running.
*/
const sqlite3 = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Please set DATABASE_URL=postgres://...');
  process.exit(1);
}

const dbPath = path.join(__dirname, 'data', 'schools.db');
if (!fs.existsSync(dbPath)) {
  console.error('SQLite DB not found at', dbPath);
  process.exit(1);
}

console.log('Opening sqlite:', dbPath);
const sqlite = sqlite3(dbPath, { readonly: true });

(async function main() {
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();
  try {
    await pg.query('BEGIN');

    // Create tables if not exist (simplified schema matching sqlite)
    await pg.query(`
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
    `);

    await pg.query(`
      CREATE TABLE IF NOT EXISTS school_contacts (
        id SERIAL PRIMARY KEY,
        school_id TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL
      );
    `);

    await pg.query(`
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
    `);

    await pg.query(`
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
    `);

    await pg.query(`
      CREATE TABLE IF NOT EXISTS school_gallery (
        id SERIAL PRIMARY KEY,
        school_id TEXT NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pg.query(`
      CREATE TABLE IF NOT EXISTS school_testimonials (
        id SERIAL PRIMARY KEY,
        school_id TEXT NOT NULL,
        author TEXT,
        title TEXT,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Transfer schools
    const schools = sqlite.prepare('SELECT * FROM schools').all();
    console.log('Found', schools.length, 'schools');
    for (const s of schools) {
      await pg.query(`
        INSERT INTO schools (id, name, type, county, location, description, mission, vision, core_values, founded, students, rating, image, hero_image, logo, website, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (id) DO NOTHING
      `, [s.id, s.name, s.type, s.county, s.location, s.description, s.mission || null, s.vision || null, s.core_values || null, s.founded, s.students, s.rating, s.image || null, s.hero_image || null, s.logo || null, s.website || null, s.created_at || null, s.updated_at || null]);
    }

    // Transfer contacts
    const contacts = sqlite.prepare('SELECT * FROM school_contacts').all();
    for (const c of contacts) {
      await pg.query(`INSERT INTO school_contacts (school_id,email,phone,address) VALUES ($1,$2,$3,$4)`, [c.school_id,c.email,c.phone,c.address]);
    }

    // Transfer people
    const people = sqlite.prepare('SELECT * FROM people').all();
    for (const p of people) {
      await pg.query(`INSERT INTO people (school_id,name,role,bio,image,display_order,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [p.school_id,p.name,p.role || 'staff',p.bio || null,p.image || null,p.display_order || 0,p.created_at || null,p.updated_at || null]);
    }

    // Transfer users
    const users = sqlite.prepare('SELECT * FROM users').all();
    for (const u of users) {
      await pg.query(`INSERT INTO users (email,password_hash,name,role,school_id,is_active,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (email) DO NOTHING`,
        [u.email,u.password_hash,u.name,u.role || 'administrator',u.school_id || null, Boolean(u.is_active),u.created_at || null,u.updated_at || null]);
    }

    // Transfer gallery
    try {
      const gallery = sqlite.prepare('SELECT * FROM school_gallery').all();
      for (const g of gallery) {
        await pg.query(`INSERT INTO school_gallery (school_id,url,caption,created_at) VALUES ($1,$2,$3,$4)`, [g.school_id,g.url,g.caption || null,g.created_at || null]);
      }
    } catch (e) { console.warn('No school_gallery table or error:', e.message); }

    // Transfer testimonials
    try {
      const t = sqlite.prepare('SELECT * FROM school_testimonials').all();
      for (const r of t) {
        await pg.query(`INSERT INTO school_testimonials (school_id,author,title,text,created_at) VALUES ($1,$2,$3,$4,$5)`, [r.school_id,r.author || null,r.title || null,r.text,r.created_at || null]);
      }
    } catch (e) { console.warn('No school_testimonials table or error:', e.message); }

    await pg.query('COMMIT');
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
    try { await pg.query('ROLLBACK'); } catch (e) { /* ignore */ }
  } finally {
    await pg.end();
    sqlite.close();
  }
})();
