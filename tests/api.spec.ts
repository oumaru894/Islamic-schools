import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as api from '../services/api';

// simple fetch mock
const globalAny: any = global;

describe('services/api helpers', () => {
  beforeEach(() => {
    globalAny.fetch = vi.fn();
    localStorage.clear();
  });

  it('listAllUsers calls /superadmin/users with auth', async () => {
    const fakeUsers = [{ id: 1, name: 'A' }];
    (globalAny.fetch as any).mockResolvedValue({ ok: true, json: async () => fakeUsers });
    localStorage.setItem('admin_token', 'tok');
    const res = await api.listAllUsers();
    expect(res).toEqual(fakeUsers);
    expect(globalAny.fetch).toHaveBeenCalledWith(expect.stringContaining('/superadmin/users'), expect.objectContaining({ headers: expect.any(Object) }));
  });

  it('createAdminBySuperadmin posts payload', async () => {
    const payload = { email: 'a@b', name: 'A', role: 'administrator' };
    (globalAny.fetch as any).mockResolvedValue({ ok: true, json: async () => ({ id: 2, ...payload }) });
    localStorage.setItem('admin_token', 'tok');
    const res = await api.createAdminBySuperadmin(payload);
    expect(res).toEqual(expect.objectContaining(payload));
    expect(globalAny.fetch).toHaveBeenCalledWith(expect.stringContaining('/superadmin/create-admin'), expect.objectContaining({ method: 'POST' }));
  });

  it('updateUserBySuperadmin sends PUT', async () => {
    (globalAny.fetch as any).mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    localStorage.setItem('admin_token', 'tok');
  const res = await api.updateUserBySuperadmin(5, { role: 'administrator' });
    expect(res).toEqual(expect.objectContaining({ success: true }));
    expect(globalAny.fetch).toHaveBeenCalledWith(expect.stringContaining('/superadmin/users/5'), expect.objectContaining({ method: 'PUT' }));
  });

  it('deactivateUserBySuperadmin calls DELETE', async () => {
    (globalAny.fetch as any).mockResolvedValue({ ok: true });
    localStorage.setItem('admin_token', 'tok');
    await expect(api.deactivateUserBySuperadmin(3)).resolves.toBeUndefined();
    expect(globalAny.fetch).toHaveBeenCalledWith(expect.stringContaining('/superadmin/users/3'), expect.objectContaining({ method: 'DELETE' }));
  });
});
