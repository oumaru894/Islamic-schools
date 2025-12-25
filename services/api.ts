import { School } from '../types';

// Get API base URL from environment variable, fallback to default
const meta: any = (import.meta as any) || {};
const API_BASE_URL = (meta.env && meta.env.VITE_API_URL) || 'http://localhost:4000/api';

// Log API configuration in development
if (meta.env && meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

// fetch all staff by school id
export async function fetchStaffBySchoolId(schoolId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/staff`);
  if (!response.ok) {
    throw new Error('Failed to fetch staff');
  }
  return response.json();
}

export async function fetchAllSchools(): Promise<School[]> {
  const response = await fetch(`${API_BASE_URL}/schools`);
  if (!response.ok) {
    throw new Error('Failed to fetch schools');
  }
  return response.json();
}

export async function fetchSchoolById(id: string): Promise<School> {
  const response = await fetch(`${API_BASE_URL}/schools/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('School not found');
    }
    throw new Error('Failed to fetch school');
  }
  return response.json();
}

export async function searchSchools(query: string): Promise<School[]> {
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search schools');
  }
  return response.json();
}

export async function createSchool(school: Omit<School, 'id'>): Promise<School> {
  const response = await fetch(`${API_BASE_URL}/schools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(school),
  });
  if (!response.ok) {
    throw new Error('Failed to create school');
  }
  return response.json();
}

export async function updateSchool(id: string, school: Partial<School>): Promise<School> {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(school),
  });
  if (!response.ok) {
    throw new Error('Failed to update school');
  }
  return response.json();
}

export async function deleteSchool(id: string): Promise<void> {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to delete school');
  }
}

// --- Gallery API ---
export async function addGalleryItem(schoolId: string, payload: { url?: string; caption?: string; fileData?: string }) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/gallery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
  body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add gallery item' }));
    throw new Error(err.error || 'Failed to add gallery item');
  }
  return res.json();
}

export async function deleteGalleryItem(schoolId: string, galleryId: number) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/gallery/${galleryId}`, {
    method: 'DELETE',
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  if (!res.ok) throw new Error('Failed to delete gallery item');
}

// --- Leadership API ---
export async function addLeadershipMember(schoolId: string, payload: { name: string; title: string; bio?: string; photo?: string; displayOrder?: number }) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/leadership`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add leadership member' }));
    throw new Error(err.error || 'Failed to add leadership member');
  }
  return res.json();
}

export async function updateLeadershipMember(schoolId: string, memberId: number, updates: any) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/leadership/${memberId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update leadership member' }));
    throw new Error(err.error || 'Failed to update leadership member');
  }
  return res.json();
}

export async function deleteLeadershipMember(schoolId: string, memberId: number) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/leadership/${memberId}`, {
    method: 'DELETE',
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  if (!res.ok) throw new Error('Failed to delete leadership member');
}

// --- Testimonials API ---
export async function addTestimonial(schoolId: string, payload: { author?: string; title?: string; text: string }) {
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add testimonial' }));
    throw new Error(err.error || 'Failed to add testimonial');
  }
  return res.json();
}



// --- People API ---
export async function listPeople(schoolId: string) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/people`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  if (!res.ok) throw new Error('Failed to list people');
  return res.json();
}

export async function addPerson(schoolId: string, payload: { name: string; role: string; bio?: string; photo?: string; isAdministrator?: boolean; fileData?: string }) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/people`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to add person' }));
    throw new Error(err.error || 'Failed to add person');
  }
  return res.json();
}

export async function updatePerson(schoolId: string, personId: number, updates: any) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/people/${personId}`, {
  method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update person' }));
    throw new Error(err.error || 'Failed to update person');
  }
  return res.json();
}

export async function deletePerson(schoolId: string, personId: number) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE_URL}/schools/${schoolId}/people/${personId}`, {
    method: 'DELETE',
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  if (!res.ok) throw new Error('Failed to delete person');
}

// Authentication API functions
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'administrator' | 'superadmin';
  school_id?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
  role: 'administrator' | 'superadmin';
    school_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

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

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(error.error || 'Registration failed');
  }
  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// --- Superadmin helpers ---
export async function listAllUsers(token?: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/superadmin/users`, {
    headers: { Authorization: token ? `Bearer ${token}` : (localStorage.getItem('admin_token') ? `Bearer ${localStorage.getItem('admin_token')}` : '') }
  });
  if (!response.ok) throw new Error('Failed to list users');
  return response.json();
}

export async function createAdminBySuperadmin(payload: any, token?: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/superadmin/create-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : (localStorage.getItem('admin_token') ? `Bearer ${localStorage.getItem('admin_token')}` : '') },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed' }));
    throw new Error(err.error || 'Failed to create admin');
  }
  return response.json();
}

export async function updateUserBySuperadmin(id: number, updates: any, token?: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/superadmin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : (localStorage.getItem('admin_token') ? `Bearer ${localStorage.getItem('admin_token')}` : '') },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
}

export async function deactivateUserBySuperadmin(id: number, token?: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/superadmin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: token ? `Bearer ${token}` : (localStorage.getItem('admin_token') ? `Bearer ${localStorage.getItem('admin_token')}` : '') }
  });
  if (!response.ok) throw new Error('Failed to deactivate user');
}

