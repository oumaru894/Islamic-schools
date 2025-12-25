import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as userService from '../src/userService';
import db from '../src/database';

// Integration-style tests that use the same DB file. These are minimal and clean up after themselves.

describe('userService integration', () => {
  const testEmail = `test_user_${Date.now()}@example.com`;
  let createdId: number | null = null;

  afterAll(() => {
    if (createdId) {
      db.prepare('DELETE FROM users WHERE id = ?').run(createdId);
    }
  });

  it('can create, update and deactivate a user', () => {
    const user = userService.createUser({ email: testEmail, password: 'pass123', name: 'Test User', role: 'administrator' });
    expect(user).toBeTruthy();
    createdId = user.id;

    const updated = userService.updateUser(user.id, { role: 'administrator', name: 'Updated' });
    expect(updated).toBeTruthy();
    expect(updated?.role).toBe('administrator');

    const deactivated = userService.deactivateUser(user.id);
    expect(deactivated).toBe(true);

    const fetched = userService.getUserById(user.id);
    expect(fetched).toBeTruthy();
    expect(fetched?.is_active).toBe(false);
  });
});
