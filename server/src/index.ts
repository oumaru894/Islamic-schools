// Load environment variables early so DATABASE_URL is available to database adapter
import dotenv from 'dotenv';
dotenv.config();
// If important vars aren't set (we may be running from server/), try loading repo root .env manually
import fs from 'fs';
import path from 'path';
const rootEnv = path.resolve(__dirname, '..', '..', '.env');
if (fs.existsSync(rootEnv)) {
  try {
    const raw = fs.readFileSync(rootEnv, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([^#=\s]+)=(.*)$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2] || '';
      // strip optional surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (err) {
    console.warn('Failed to load root .env:', err);
  }
}

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v2 as cloudinary } from 'cloudinary';
import { initializeDatabase } from './database';
import { seedDatabase } from './seed';
import * as schoolService from './schoolService';
import db from './database';
import * as userService from './userService';
import { authenticateToken, requireSchoolAccess, AuthenticatedRequest } from './authMiddleware';

const app = express();

// Configure CORS to allow frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://islamic-schools-1.onrender.com' || 'http://localhost:3000',
  credentials: true
}));

// Allow larger JSON payloads so frontend can submit image DataURLs when uploading images inline
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database on startup (database.initializeDatabase may be async for Postgres)
async function start() {
  await initializeDatabase();

    // Seed database if empty (optional - remove if you don't want auto-seeding)
    try {
      const all = await (schoolService as any).getAllSchools();
      const schoolCount = Array.isArray(all) ? all.length : 0;
      if (schoolCount === 0) {
        console.log('Database is empty, seeding...');
        await seedDatabase();
      }
    } catch (e) {
      console.warn('Seeding skipped:', e);
    }
}

start().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Ensure uploads directory exists and serve it
const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.warn('Could not create uploads dir:', e);
}
app.use('/data/uploads', express.static(uploadsDir));

// Configure Cloudinary from environment. Prefer CLOUDINARY_URL if present.
if (process.env.CLOUDINARY_URL) {
  // Parse CLOUDINARY_URL like: cloudinary://<api_key>:<api_secret>@<cloud_name>
  try {
    const m = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) {
      const api_key = m[1];
      const api_secret = m[2];
      const cloud_name = m[3];
      cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
      console.log('Cloudinary configured for cloud:', cloud_name);
    } else {
      // fallback to passing the raw url
      cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL, secure: true });
      console.log('Cloudinary configured from CLOUDINARY_URL');
    }
  } catch (err) {
    console.warn('Failed to parse CLOUDINARY_URL:', err);
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL, secure: true });
  }
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('Cloudinary configured from individual CLOUDINARY_* vars for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
}

// Consider Cloudinary configured when the environment provides credentials.
if (!(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET))) {
  console.warn('Cloudinary not configured. Image uploads will fall back to local filesystem. Set CLOUDINARY_URL or CLOUDINARY_* env variables.');
}

app.get('/api/schools', async (req, res) => {
  try {
    const schools = await (schoolService as any).getAllSchools();
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schools/:id', async (req, res) => {
  try {
    const school = await (schoolService as any).getSchoolById(req.params.id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add testimonial to a school (public for now)
app.post('/api/schools/:id/testimonials', (req, res) => {
  try {
    const { author, title, text } = req.body;
    if (!text) return res.status(400).json({ error: 'Testimonial text is required' });

    const school = schoolService.getSchoolById(req.params.id);
    if (!school) return res.status(404).json({ error: 'School not found' });

    // Insert testimonial
    (async () => {
      const stmt: any = db.prepare(`INSERT INTO school_testimonials (school_id, author, title, text) VALUES (?, ?, ?, ?)`);
      const info = await stmt.run(req.params.id, author || null, title || null, text);
      const sel: any = db.prepare(`SELECT id, author, title, text, created_at as createdAt FROM school_testimonials WHERE id = ?`);
      const inserted = await sel.get(info.lastInsertRowid);
      res.status(201).json(inserted);
    })().catch(err => { console.error('Error adding testimonial:', err); res.status(500).json({ error: 'Internal server error' }); });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public endpoints - no authentication required
app.post('/api/schools', async (req, res) => {
  try {
    const newSchool = await (schoolService as any).createSchool(req.body);
    res.status(201).json(newSchool);
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected endpoints - require authentication and school access
app.put('/api/schools/:id', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const updatedSchool = schoolService.updateSchool(req.params.id, req.body);
    if (!updatedSchool) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json(updatedSchool);
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/schools/:id', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const deleted = schoolService.deleteSchool(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'School not found' });
    }
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search', (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q) {
      return res.json([]);
    }
    const results = schoolService.searchSchools(q);
    res.json(results);
  } catch (error) {
    console.error('Error searching schools:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User authentication endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    (async () => {
      const user = await (userService as any).createUser(req.body);
      const loginResult = await (userService as any).loginUser({ email: user.email, password: req.body.password });
      res.status(201).json(loginResult);
    })().catch((error: any) => { console.error('Error registering user:', error); res.status(400).json({ error: error.message || 'Registration failed' }); });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    (async () => {
      const result = await (userService as any).loginUser(req.body);
      res.json(result);
    })().catch((error: any) => { console.error('Error logging in:', error); res.status(401).json({ error: error.message || 'Login failed' }); });
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    (async () => {
      const user = await (userService as any).getUserById(req.user!.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    })().catch(err => { console.error('Error fetching user:', err); res.status(500).json({ error: 'Internal server error' }); });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get users for a school (requires authentication)
app.get('/api/schools/:id/users', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    (async () => {
      const users = await (userService as any).getUsersBySchool(req.params.id);
      res.json(users);
    })().catch(err => { console.error('Error fetching school users:', err); res.status(500).json({ error: 'Internal server error' }); });
  } catch (error) {
    console.error('Error fetching school users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gallery CRUD for a school
app.post('/api/schools/:id/gallery', authenticateToken, requireSchoolAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { url, caption, fileData } = req.body as any;

    // If fileData is provided as a DataURL, upload it to Cloudinary (preferred) or fall back to local file
    if (fileData && typeof fileData === 'string' && fileData.startsWith('data:')) {
      const matches = fileData.match(/^data:(.+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Invalid fileData format' });
      const b64 = matches[2];
      const dataUri = `data:${matches[1]};base64,${b64}`;

      let publicUrl: string;
      if (cloudinary.config().cloud_name) {
        // Upload using Cloudinary from the DataURI
        try {
          const uploadResult: any = await cloudinary.uploader.upload(dataUri, { folder: `islamic_schools/${req.params.id}/gallery` });
          publicUrl = uploadResult.secure_url;
        } catch (err) {
          console.error('Cloudinary upload error:', err);
          return res.status(500).json({ error: 'Image upload failed' });
        }
      } else {
        // fallback to filesystem if cloudinary not configured
        const mime = matches[1];
        const ext = mime.split('/').pop() || 'png';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(b64, 'base64');
        fs.writeFileSync(filepath, buffer);
        publicUrl = `${req.protocol}://${req.get('host')}/data/uploads/${filename}`;
      }

      const item = schoolService.addGalleryItem(req.params.id, publicUrl, caption);
      return res.status(201).json(item);
    }

    if (!url) return res.status(400).json({ error: 'Image URL or fileData is required' });
    const item = schoolService.addGalleryItem(req.params.id, url, caption);
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding gallery item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/schools/:id/gallery/:galleryId', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const ok = schoolService.deleteGalleryItem(Number(req.params.galleryId));
    if (!ok) return res.status(404).json({ error: 'Gallery item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting gallery item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leadership (administrators) CRUD for a school - these are non-login personnel entries
app.post('/api/schools/:id/leadership', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const { name, title, bio, photo, displayOrder } = req.body;
    if (!name || !title) return res.status(400).json({ error: 'Name and title are required' });
    const member = schoolService.addLeadershipMember(req.params.id, name, title, bio, photo, displayOrder);
    res.status(201).json(member);
  } catch (err) {
    console.error('Error adding leadership member:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/schools/:id/leadership/:memberId', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const updates = req.body;
    const updated = schoolService.updateLeadershipMember(Number(req.params.memberId), updates);
    if (!updated) return res.status(404).json({ error: 'Leadership member not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating leadership member:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/schools/:id/leadership/:memberId', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const ok = schoolService.deleteLeadershipMember(Number(req.params.memberId));
    if (!ok) return res.status(404).json({ error: 'Leadership member not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting leadership member:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// People CRUD (central staff/administrators table)
app.get('/api/schools/:id/people', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const rows = schoolService.getPeopleBySchool(req.params.id);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching people:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/schools/:id/people', authenticateToken, requireSchoolAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, role, bio, photo, isAdministrator, fileData } = req.body as any;
    if (!name || !role) return res.status(400).json({ error: 'Name and role are required' });

    let photoUrl = photo || null;
    if (fileData && typeof fileData === 'string' && fileData.startsWith('data:')) {
      const matches = fileData.match(/^data:(.+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Invalid fileData format' });
      const b64 = matches[2];
      const dataUri = `data:${matches[1]};base64,${b64}`;
      if (cloudinary.config().cloud_name) {
        try {
          const uploadResult: any = await cloudinary.uploader.upload(dataUri, { folder: `islamic_schools/${req.params.id}/people` });
          photoUrl = uploadResult.secure_url;
        } catch (err) {
          console.error('Cloudinary upload error:', err);
          return res.status(500).json({ error: 'Image upload failed' });
        }
      } else {
        const mime = matches[1];
        const ext = mime.split('/').pop() || 'png';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(b64, 'base64');
        fs.writeFileSync(filepath, buffer);
        photoUrl = `${req.protocol}://${req.get('host')}/data/uploads/${filename}`;
      }
    }

    const person = schoolService.addPerson(req.params.id, name, role, bio, photoUrl);
    res.status(201).json(person);
  } catch (err) {
    console.error('Error adding person:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/schools/:id/people/:personId', authenticateToken, requireSchoolAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const updates = req.body as any;
    // support fileData for image upload
    if (updates.fileData && typeof updates.fileData === 'string' && updates.fileData.startsWith('data:')) {
      const matches = updates.fileData.match(/^data:(.+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: 'Invalid fileData format' });
      const b64 = matches[2];
      const dataUri = `data:${matches[1]};base64,${b64}`;
      if (cloudinary.config().cloud_name) {
        try {
          const uploadResult: any = await cloudinary.uploader.upload(dataUri, { folder: `islamic_schools/${req.params.id}/people` });
          updates.image = uploadResult.secure_url;
        } catch (err) {
          console.error('Cloudinary upload error:', err);
          return res.status(500).json({ error: 'Image upload failed' });
        }
      } else {
        const mime = matches[1];
        const ext = mime.split('/').pop() || 'png';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(b64, 'base64');
        fs.writeFileSync(filepath, buffer);
        updates.image = `${req.protocol}://${req.get('host')}/data/uploads/${filename}`;
      }
      delete updates.fileData;
    }
    const updated = schoolService.updatePerson(Number(req.params.personId), updates);
    if (!updated) return res.status(404).json({ error: 'Person not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating person:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/schools/:id/people/:personId', authenticateToken, requireSchoolAccess, (req: AuthenticatedRequest, res) => {
  try {
    const ok = schoolService.deletePerson(Number(req.params.personId));
    if (!ok) return res.status(404).json({ error: 'Person not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting person:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Superadmin routes
function requireSuperAdmin(req: AuthenticatedRequest, res: any, next: any) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Superadmin access required' });
  next();
}

// Create a new admin (superadmin only)
app.post('/api/superadmin/create-admin', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'superadmin') return res.status(403).json({ error: 'Superadmin access required' });
  // debug logging
  console.log('superadmin create request by:', req.user?.email, 'role:', req.user?.role);
  console.log('payload:', req.body);
      const { email, password, name, role, school_id } = req.body;
      (async () => {
        const user = await (userService as any).createUser({ email, password, name, role, school_id });
        res.status(201).json(user);
      })().catch((error: any) => { console.error('Error creating admin by superadmin:', error); res.status(400).json({ error: error.message || 'Failed to create admin' }); });
  } catch (error: any) {
    console.error('Error creating admin by superadmin:', error);
    res.status(400).json({ error: error.message || 'Failed to create admin' });
  }
});

// List all users (superadmin only)
app.get('/api/superadmin/users', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'superadmin') return res.status(403).json({ error: 'Superadmin access required' });
    (async () => {
      const stmt: any = db.prepare('SELECT id, email, name, role, school_id, is_active, created_at, updated_at FROM users ORDER BY name');
      const rows = await stmt.all();
      res.json(rows.map((r: any) => ({ ...r, is_active: Boolean(r.is_active) })));
    })().catch(err => { console.error('Error listing users for superadmin:', err); res.status(500).json({ error: 'Internal server error' }); });
  } catch (error) {
    console.error('Error listing users for superadmin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (superadmin only)
app.put('/api/superadmin/users/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'superadmin') return res.status(403).json({ error: 'Superadmin access required' });
    const id = Number(req.params.id);
    const updates = req.body;
    (async () => {
      const updated = await (userService as any).updateUser(id, updates);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json(updated);
    })().catch((error: any) => { console.error('Error updating user by superadmin:', error); res.status(400).json({ error: error.message || 'Failed to update user' }); });
  } catch (error: any) {
    console.error('Error updating user by superadmin:', error);
    res.status(400).json({ error: error.message || 'Failed to update user' });
  }
});

// Deactivate user (superadmin only)
app.delete('/api/superadmin/users/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || req.user.role !== 'superadmin') return res.status(403).json({ error: 'Superadmin access required' });
    const id = Number(req.params.id);
    (async () => {
      const ok = await (userService as any).deactivateUser(id);
      if (!ok) return res.status(404).json({ error: 'User not found' });
      res.json({ message: 'User deactivated' });
    })().catch((error: any) => { console.error('Error deactivating user by superadmin:', error); res.status(500).json({ error: 'Internal server error' }); });
  } catch (error) {
    console.error('Error deactivating user by superadmin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 4000;
// If a built frontend exists at the repository root `dist/`, serve it as static files.
// This allows a single server image to serve both API and frontend in production.
try {
  const clientDist = path.join(__dirname, '..', '..', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // Serve index.html for any non-API route so client-side routing works.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/data')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log('Serving static frontend from', clientDist);
  }
} catch (e) {
  console.warn('Error configuring static frontend serving:', e);
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    const count = Array.isArray((schoolService as any).getAllSchools) ? (schoolService as any).getAllSchools().length : 'unknown';
    console.log(`Database initialized with ${count} schools`);
  } catch (_) {
    console.log('Database initialized (count unavailable)');
  }
});

// Health endpoint for load balancers and platform checks
app.get('/health', (req, res) => {
  try {
    // simple DB check
    const ok = Array.isArray((schoolService as any).getAllSchools());
    if (!ok) return res.status(500).json({ status: 'error' });
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});
