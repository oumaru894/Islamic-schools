import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { fetchAllSchools, createAdminBySuperadmin } from '../services/api';
import { getToken } from '../services/authService';
import { saveAuth } from '../services/authService';

interface SchoolOption {
  id: string;
  name: string;
}

const AdminCreate: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'administrator' | 'superadmin'>('administrator');
  const [schoolId, setSchoolId] = useState<string | ''>('');
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchAllSchools()
      .then(list => { if (mounted) setSchools(list.map(s => ({ id: (s as any).id, name: (s as any).name }))); })
      .catch(() => { /* ignore */ });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email and password are required');
      return;
    }

    setLoading(true);
    try {
  const payload: any = { name, email, password, role };
  if (schoolId) payload.school_id = schoolId;
  await createAdminBySuperadmin(payload);

      // created successfully
      navigate('/superadmin');
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white p-6 rounded shadow-sm border">
        <h2 className="text-2xl font-bold mb-4">Create Administrator</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as any)} className="mt-1 block w-full border rounded p-2">
              <option value="administrator">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Assign to school (optional)</label>
            <select value={schoolId} onChange={e => setSchoolId(e.target.value)} className="mt-1 block w-full border rounded p-2">
              <option value="">-- No school (global) --</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" isLoading={loading}>Create</Button>
            <Button type="button" variant="outline" onClick={() => { setName(''); setEmail(''); setPassword(''); setSchoolId(''); }}>Reset</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreate;
