import db from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'administrator' | 'superadmin';
  school_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  password: string;
  name: string;
  role?: 'administrator' | 'superadmin';
  school_id?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

/**
 * Hash a password
 */
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verify a password
 */
function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Generate JWT token
 */
function generateToken(userId: number, email: string, schoolId: string | null, role: string): string {
  return jwt.sign(
    { userId, email, schoolId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: number; email: string; schoolId: string | null; role?: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      schoolId: decoded.schoolId || null,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

/**
 * Create a new user
 */
export function createUser(userData: UserCreate): User {
  // Check if email already exists
  const existing = db.prepare(`
    SELECT id FROM users WHERE email = ?
  `).get(userData.email) as any;

  if (existing) {
    throw new Error('Email already registered');
  }

  // Validate school exists if school_id is provided
  if (userData.school_id) {
    const school = db.prepare(`
      SELECT id FROM schools WHERE id = ?
    `).get(userData.school_id) as any;

    if (!school) {
      throw new Error('School not found');
    }
  }

  const passwordHash = hashPassword(userData.password);
  const role = userData.role || 'administrator';

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, school_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    userData.email,
    passwordHash,
    userData.name,
    role,
    userData.school_id || null
  );

  const user = getUserById(result.lastInsertRowid as number);
  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}

/**
 * Get user by ID
 */
export function getUserById(id: number): User | null {
  const user = db.prepare(`
    SELECT id, email, name, role, school_id, is_active, created_at, updated_at
    FROM users WHERE id = ?
  `).get(id) as any;

  if (!user) return null;

  return {
    ...user,
    is_active: Boolean(user.is_active)
  };
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): (User & { password_hash: string }) | null {
  const user = db.prepare(`
    SELECT id, email, password_hash, name, role, school_id, is_active, created_at, updated_at
    FROM users WHERE email = ?
  `).get(email) as any;

  if (!user) return null;

  return {
    ...user,
    is_active: Boolean(user.is_active)
  };
}

/**
 * Login user
 */
export function loginUser(credentials: UserLogin): AuthResponse {
  const user = getUserByEmail(credentials.email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  if (!verifyPassword(credentials.password, user.password_hash)) {
    throw new Error('Invalid email or password');
  }

  const { password_hash, ...userWithoutPassword } = user;
  const token = generateToken(user.id, user.email, user.school_id, user.role as string);

  return {
    user: userWithoutPassword,
    token
  };
}

/**
 * Check if user can manage a school
 */
export function canManageSchool(userId: number, schoolId: string): boolean {
  const user = getUserById(userId);
  
  if (!user) return false;
  if (!user.is_active) return false;
  
  // Administrators can manage their school
  // Superadmin can manage any school
  if (user.role === 'superadmin') return true;

  if (user.school_id === schoolId && user.role === 'administrator') {
    return true;
  }

  return false;
}

/**
 * Get all users for a school
 */
export function getUsersBySchool(schoolId: string): User[] {
  const users = db.prepare(`
    SELECT id, email, name, role, school_id, is_active, created_at, updated_at
    FROM users 
    WHERE school_id = ? AND is_active = 1
    ORDER BY name
  `).all(schoolId) as any[];

  return users.map(user => ({
    ...user,
    is_active: Boolean(user.is_active)
  }));
}

/**
 * Update user
 */
export function updateUser(id: number, updates: Partial<Omit<UserCreate, 'email'>>): User | null {
  const existing = getUserById(id);
  if (!existing) return null;

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (updates.name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(updates.name);
  }

  if (updates.role !== undefined) {
    updateFields.push('role = ?');
    updateValues.push(updates.role);
  }

  if (updates.school_id !== undefined) {
    if (updates.school_id) {
      // Validate school exists
      const school = db.prepare('SELECT id FROM schools WHERE id = ?').get(updates.school_id);
      if (!school) {
        throw new Error('School not found');
      }
    }
    updateFields.push('school_id = ?');
    updateValues.push(updates.school_id || null);
  }

  if (updates.password !== undefined) {
    updateFields.push('password_hash = ?');
    updateValues.push(hashPassword(updates.password));
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  db.prepare(`
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE id = ?
  `).run(...updateValues);

  return getUserById(id);
}

/**
 * Deactivate user
 */
export function deactivateUser(id: number): boolean {
  const user = getUserById(id);
  if (!user) return false;

  db.prepare(`
    UPDATE users 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);

  return true;
}




