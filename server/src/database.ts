import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'schools.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
export function initializeDatabase() {
  // Schools table
  db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS school_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS school_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id TEXT NOT NULL,
      feature TEXT NOT NULL,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS school_leadership (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT,
      photo TEXT,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
    );

    -- new people table: consolidate staff/administrators
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'administrator',
      school_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
      CHECK(role IN ('administrator', 'superadmin'))
    );

    CREATE INDEX IF NOT EXISTS idx_schools_county ON schools(county);
    CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
    CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
    CREATE INDEX IF NOT EXISTS idx_leadership_school_id ON school_leadership(school_id);
  CREATE INDEX IF NOT EXISTS idx_people_school_id ON people(school_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
  `);

  // Migrate existing database to add new columns if they don't exist
  migrateDatabase();

  console.log('Database initialized successfully');
}

// Migration function to add new columns to existing databases
function migrateDatabase() {
  try {
    // Check if mission column exists
    const columns = db.prepare("PRAGMA table_info(schools)").all() as any[];
    const columnNames = columns.map(col => col.name);
    
    // Add mission column if it doesn't exist
    if (!columnNames.includes('mission')) {
      db.exec('ALTER TABLE schools ADD COLUMN mission TEXT');
      console.log('Added mission column to schools table');
    }
    
    // Ensure users table allows 'superadmin' role; if not, recreate safely
    try {
      const userTableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get() as any;
      const usersSql = userTableInfo && userTableInfo.sql ? String(userTableInfo.sql) : '';
      if (usersSql && !usersSql.includes("superadmin")) {
        console.log('Migrating users table to include administrator+superadmin roles (mapping staff->administrator)');
        db.exec('BEGIN TRANSACTION');
        db.exec(`
          ALTER TABLE users RENAME TO users_old;
        `);

        db.exec(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'administrator',
            school_id TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
            CHECK(role IN ('administrator', 'superadmin'))
          );
        `);

        // Copy existing users
        // Map any legacy 'staff' role to 'administrator' during copy
        db.exec(`
          INSERT INTO users (id, email, password_hash, name, role, school_id, is_active, created_at, updated_at)
          SELECT id, email, password_hash, name,
            CASE WHEN role = 'staff' THEN 'administrator' WHEN role IS NULL THEN 'administrator' ELSE role END as role,
            school_id, is_active, created_at, updated_at FROM users_old;
        `);

        db.exec('DROP TABLE users_old;');
        db.exec('COMMIT');
        console.log('Users table migrated to include superadmin role');
      }
    } catch (err) {
      console.warn('Users table migration skipped or failed:', err);
      try { db.exec('ROLLBACK'); } catch (e) { /* ignore */ }
    }
    
    // Add vision column if it doesn't exist
    if (!columnNames.includes('vision')) {
      db.exec('ALTER TABLE schools ADD COLUMN vision TEXT');
      console.log('Added vision column to schools table');
    }
    
    // Add theme column (JSON) if it doesn't exist
    if (!columnNames.includes('theme')) {
      try {
        db.exec("ALTER TABLE schools ADD COLUMN theme TEXT");
        console.log('Added theme column to schools table');
      } catch (err) {
        console.warn('Could not add theme column:', err);
      }
    }

    // Add core_values column (JSON/text) if it doesn't exist
    if (!columnNames.includes('core_values')) {
      try {
        db.exec("ALTER TABLE schools ADD COLUMN core_values TEXT");
        // initialize existing rows with an empty array JSON
        try { db.exec("UPDATE schools SET core_values = '[]' WHERE core_values IS NULL"); } catch (e) { /* ignore */ }
        console.log('Added core_values column to schools table');
      } catch (err) {
        console.warn('Could not add core_values column:', err);
      }
    }

    // Ensure testimonials table exists
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='school_testimonials'").all();
    if (!tables || tables.length === 0) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS school_testimonials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          school_id TEXT NOT NULL,
          author TEXT,
          title TEXT,
          text TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
        );
      `);
      console.log('Created school_testimonials table');
    }
    
    // Ensure gallery table exists
    const galleryTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='school_gallery'").all();
    if (!galleryTables || galleryTables.length === 0) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS school_gallery (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          school_id TEXT NOT NULL,
          url TEXT NOT NULL,
          caption TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
        );
      `);
      console.log('Created school_gallery table');
    }

    // Migrate existing leadership into people table if people is empty
    try {
        // If a legacy people table exists but is missing newer columns (like `image`), add them first so subsequent INSERTs succeed.
        try {
          const peopleTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='people'").all();
          if (peopleTable && peopleTable.length > 0) {
            const pplCols = (db.prepare("PRAGMA table_info(people)").all() as any[]).map(c => c.name);
            if (!pplCols.includes('image')) {
              try {
                db.exec("ALTER TABLE people ADD COLUMN image TEXT");
                console.log('Added image column to existing people table');
              } catch (e) {
                console.warn('Could not add image column to people table:', e);
              }
            }
            if (!pplCols.includes('display_order')) {
              try { db.exec("ALTER TABLE people ADD COLUMN display_order INTEGER DEFAULT 0"); } catch (e) { /* ignore */ }
            }
            if (!pplCols.includes('created_at')) {
              try { db.exec("ALTER TABLE people ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch (e) { /* ignore */ }
            }
            if (!pplCols.includes('updated_at')) {
              try { db.exec("ALTER TABLE people ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP"); } catch (e) { /* ignore */ }
            }
            if (!pplCols.includes('role')) {
              try { db.exec("ALTER TABLE people ADD COLUMN role TEXT NOT NULL DEFAULT 'staff'"); } catch (e) { /* ignore */ }
            }
            if (!pplCols.includes('is_administrator')) {
              try { db.exec("ALTER TABLE people ADD COLUMN is_administrator INTEGER DEFAULT 0"); } catch (e) { /* ignore */ }
            }
          }
        } catch (e) {
          console.warn('Could not introspect/alter existing people table:', e);
        }

        const peopleCount = db.prepare('SELECT COUNT(1) as c FROM people').get();
        if (peopleCount && (peopleCount as any)['c'] === 0) {
          const leadershipRows = db.prepare('SELECT school_id, name, title, bio, photo, display_order FROM school_leadership').all() as any[];
          const insert = db.prepare('INSERT INTO people (school_id, name, role, bio, image, display_order) VALUES (?, ?, ?, ?, ?, ?)');
          db.transaction(() => {
            for (const r of leadershipRows) {
              insert.run(r.school_id, r.name, r.title || 'Administrator', r.bio || null, r.photo || null, r.display_order || 0);
            }
          })();
          console.log('Migrated school_leadership into people table');
        }
    } catch (err) {
      console.warn('People migration skipped or failed:', err);
    }

    // Ensure people table exists (centralized table for staff/administrators)
    const peopleTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='people'").all();
    if (!peopleTables || peopleTables.length === 0) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS people (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          school_id TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          bio TEXT,
          photo TEXT,
          is_administrator INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
        );
      `);
      console.log('Created people table');

      // If there are existing rows in school_leadership, migrate them into people
      try {
        const existingLeadership = db.prepare('SELECT id, school_id, name, title, bio, photo, display_order FROM school_leadership').all() as any[];
        if (existingLeadership && existingLeadership.length > 0) {
          const insert = db.prepare('INSERT INTO people (school_id, name, role, bio, photo, is_administrator) VALUES (?, ?, ?, ?, ?, ?)');
          const migrate = db.transaction(() => {
            for (const l of existingLeadership) {
              insert.run(l.school_id, l.name, l.title || 'Administrator', l.bio || null, l.photo || null, 1);
            }
          });
          migrate();
          console.log(`Migrated ${existingLeadership.length} leadership rows into people`);
        }
      } catch (mErr) {
        console.warn('People migration skipped or failed:', mErr);
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

export default db;

