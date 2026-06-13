const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://grind-production-a2ac.up.railway.app';

export interface AdminStats {
  totalUsers: number;
  proUsers: number;
  eliteUsers: number;
  totalXP: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  subscription_plan: string;
  created_at: string;
  xp: number;
  streak: number;
}

export const adminApi = {
  getStats: async (token: string): Promise<AdminStats> => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to query admin stats');
    }
    return res.json();
  },

  getUsers: async (token: string): Promise<AdminUser[]> => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to query users registry');
    }
    return res.json();
  },

  editUser: async (token: string, userId: string, payload: {
    username: string;
    email: string;
    role: string;
    subscription_plan: string;
    xp: number;
    streak: number;
  }): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update user registry');
    }
    return res.json();
  },

  deleteUser: async (token: string, userId: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete user account');
    }
    return res.json();
  },

  startNewSeason: async (token: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE_URL}/api/admin/new-season`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to start a new season');
    }
    return res.json();
  },
};
