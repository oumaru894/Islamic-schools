import React, { useEffect, useState } from 'react';
import { fetchAllSchools, updateUserBySuperadmin, deactivateUserBySuperadmin, listAllUsers } from '../services/api';
import Button from '../components/Button';
import { getToken } from '../services/authService';

interface UserRow { id: number; email: string; name: string; role: string; school_id: string | null; is_active: number }

const UserEditModal: React.FC<{ user: UserRow | null; schools: any[]; onClose: () => void; onSave: (u: UserRow) => void }> = ({ user, schools, onClose, onSave }) => {
  const [form, setForm] = useState<UserRow | null>(user);
  useEffect(() => setForm(user), [user]);
  if (!user || !form) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
        <label className="block mb-2 text-sm">Name
          <input className="w-full border p-2 mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </label>
        <label className="block mb-2 text-sm">Email
          <input className="w-full border p-2 mt-1" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </label>
        <label className="block mb-2 text-sm">Role
          <select className="w-full border p-2 mt-1" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="administrator">administrator</option>
            <option value="superadmin">superadmin</option>
          </select>
        </label>
        <label className="block mb-4 text-sm">School
          <select className="w-full border p-2 mt-1" value={form.school_id || ''} onChange={e => setForm({...form, school_id: e.target.value || null})}>
            <option value="">Global</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <div className="flex justify-end gap-3">
          <button className="px-3 py-2 border rounded" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 bg-emerald-600 text-white rounded" onClick={() => { onSave(form); }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [active, setActive] = useState<'users' | 'schools' | 'testimonials' | 'gallery' | 'settings'>('users');

  useEffect(() => {
    let mounted = true;
  // fetch users via superadmin endpoint using API helper
  listAllUsers().then(data => { if (mounted) setUsers(data); }).catch((err) => { console.error('Failed to list users', err); }).finally(() => { if (mounted) setLoading(false); });

    fetchAllSchools().then(s => { if (mounted) setSchools(s); }).catch(() => {});

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-12">Loading superadmin dashboard...</div>;

  const handleSave = async (u: UserRow) => {
    try {
      await updateUserBySuperadmin(u.id, { name: u.name, email: u.email, role: u.role, school_id: u.school_id });
  // refresh users
  const data = await listAllUsers();
  setUsers(data);
      setEditing(null);
      alert('User updated');
    } catch (err: any) { alert(err.message || 'Failed'); }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this user?')) return;
    try { await deactivateUserBySuperadmin(id); const res = await fetch('/api/superadmin/users', { headers: { Authorization: `Bearer ${getToken() || ''}` } }); setUsers(await res.json()); alert('Deactivated'); } catch (err: any) { alert(err.message || 'Failed'); }
    try { await deactivateUserBySuperadmin(id); const data = await listAllUsers(); setUsers(data); alert('Deactivated'); } catch (err: any) { alert(err.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-white rounded p-4 border">
          <h2 className="font-semibold mb-4">Admin Console</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <button className={`w-full text-left py-2 px-3 rounded ${active === 'users' ? 'bg-emerald-50' : ''}`} onClick={() => setActive('users')}>Users</button>
            </li>
            <li>
              <button className={`w-full text-left py-2 px-3 rounded ${active === 'schools' ? 'bg-emerald-50' : ''}`} onClick={() => setActive('schools')}>Schools</button>
            </li>
            <li>
              <button className={`w-full text-left py-2 px-3 rounded ${active === 'testimonials' ? 'bg-emerald-50' : ''}`} onClick={() => setActive('testimonials')}>Testimonials</button>
            </li>
            <li>
              <button className={`w-full text-left py-2 px-3 rounded ${active === 'gallery' ? 'bg-emerald-50' : ''}`} onClick={() => setActive('gallery')}>Gallery</button>
            </li>
            <li>
              <button className={`w-full text-left py-2 px-3 rounded ${active === 'settings' ? 'bg-emerald-50' : ''}`} onClick={() => setActive('settings')}>Settings</button>
            </li>
          </ul>
          <div className="mt-4">
            <a href="/admin/create"><Button>Create Admin</Button></a>
          </div>
        </aside>

        <main className="col-span-9">
          {active === 'users' && (
            <section className="bg-white p-4 rounded">
              <h2 className="font-semibold mb-2">Users</h2>
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left text-sm text-slate-600">
                    <th className="w-1/4">Name</th>
                    <th className="w-1/4">Email</th>
                    <th className="w-1/6">Role</th>
                    <th className="w-1/6">School</th>
                    <th className="w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t">
                      <td className="py-2">{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.school_id || 'Global'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="text-sm text-emerald-700" onClick={() => setEditing(u)}>Edit</button>
                          <button className="text-sm text-red-600" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {active === 'schools' && (
            <section className="bg-white p-4 rounded">
              <h2 className="font-semibold mb-2">Schools</h2>
              <div className="grid md:grid-cols-3 gap-3">
                {schools.map((s: any) => (
                  <div key={s.id} className="border rounded p-3">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-slate-600">{s.location}</div>
                    <div className="mt-2">
                      <a className="text-sm text-indigo-600" href={`/admin/manage-school/${s.id}`}>Open in Manager</a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(active === 'testimonials' || active === 'gallery' || active === 'settings') && (
            <section className="bg-white p-6 rounded">
              <h2 className="font-semibold mb-2">{active.charAt(0).toUpperCase() + active.slice(1)}</h2>
              <p className="text-sm text-slate-600">Administration tools for {active} will go here.</p>
            </section>
          )}
        </main>
      </div>
      <UserEditModal user={editing} schools={schools} onClose={() => setEditing(null)} onSave={handleSave} />
    </div>
  );
};

export default SuperAdminDashboard;
