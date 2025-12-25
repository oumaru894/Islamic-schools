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
export async function createUser(userData: UserCreate): Promise<User> {
  // Check if email already exists
  const existing = await db.prepare(`SELECT id FROM users WHERE email = ?`).get(userData.email) as any;
  if (existing) throw new Error('Email already registered');
  if (userData.school_id) {
    const school = await db.prepare(`SELECT id FROM schools WHERE id = ?`).get(userData.school_id) as any;
    if (!school) throw new Error('School not found');
  }
  const passwordHash = hashPassword(userData.password);
  const role = userData.role || 'administrator';
  const res = await db.prepare(`INSERT INTO users (email, password_hash, name, role, school_id) VALUES (?, ?, ?, ?, ?)`).run(userData.email, passwordHash, userData.name, role, userData.school_id || null);
  const user = await getUserById(res.lastInsertRowid as number);
  if (!user) throw new Error('Failed to create user');
  return user as User;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const user = await db.prepare(`SELECT id, email, name, role, school_id, is_active, created_at, updated_at FROM users WHERE id = ?`).get(id) as any;
  if (!user) return null;
  return { ...user, is_active: Boolean(user.is_active) };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const user = await db.prepare(`SELECT id, email, password_hash, name, role, school_id, is_active, created_at, updated_at FROM users WHERE email = ?`).get(email) as any;
  if (!user) return null;
  return { ...user, is_active: Boolean(user.is_active) };
}

/**
 * Login user
 */
export async function loginUser(credentials: UserLogin): Promise<AuthResponse> {
  const user = await getUserByEmail(credentials.email) as any;
  if (!user) throw new Error('Invalid email or password');
  if (!user.is_active) throw new Error('Account is deactivated');
  if (!verifyPassword(credentials.password, user.password_hash)) throw new Error('Invalid email or password');
  const { password_hash, ...userWithoutPassword } = user;
  const token = generateToken(user.id, user.email, user.school_id, user.role as string);
  return { user: userWithoutPassword, token };
}

/**
 * Check if user can manage a school
 */
export async function canManageSchool(userId: number, schoolId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;
  if (!user.is_active) return false;
  if (user.role === 'superadmin') return true;
  if (user.school_id === schoolId && user.role === 'administrator') return true;
  return false;
}

/**
 * Get all users for a school
 */
export async function getUsersBySchool(schoolId: string): Promise<User[]> {
  const users = await db.prepare(`SELECT id, email, name, role, school_id, is_active, created_at, updated_at FROM users WHERE school_id = ? AND is_active = true ORDER BY name`).all(schoolId) as any[];
  return users.map(u => ({ ...u, is_active: Boolean(u.is_active) }));
}

/**
 * Update user
 */
export async function updateUser(id: number, updates: Partial<Omit<UserCreate, 'email'>>): Promise<User | null> {
  const existing = await getUserById(id);
  if (!existing) return null;
  const updateFields: string[] = [];
  const updateValues: any[] = [];
  if (updates.name !== undefined) { updateFields.push('name = ?'); updateValues.push(updates.name); }
  if (updates.role !== undefined) { updateFields.push('role = ?'); updateValues.push(updates.role); }
  if (updates.school_id !== undefined) {
    if (updates.school_id) {
      const school = await db.prepare('SELECT id FROM schools WHERE id = ?').get(updates.school_id);
      if (!school) throw new Error('School not found');
    }
    updateFields.push('school_id = ?'); updateValues.push(updates.school_id || null);
  }
  if (updates.password !== undefined) { updateFields.push('password_hash = ?'); updateValues.push(hashPassword(updates.password)); }
  if (updateFields.length === 0) return existing;
  updateFields.push('updated_at = CURRENT_TIMESTAMP'); updateValues.push(id);
  await db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);
  return getUserById(id);
}

/**
 * Deactivate user
 */
export async function deactivateUser(id: number): Promise<boolean> {
  const user = await getUserById(id);
  if (!user) return false;
  await db.prepare(`UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
  return true;
}




