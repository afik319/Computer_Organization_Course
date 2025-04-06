export const User = {
  me: async () => {
    try {
      const res = await fetch(`/api/registered-users/me`, {
        method: 'GET',
        credentials: 'include'
      });
  
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.log('Failed to fetch current user:', err);
      return null;
    }
  },  

  login: async (email, fullName) => {
    try {
      const res = await fetch('/api/registered-users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName }),
        credentials: 'include' 
      });
      if (!res.ok) {
        console.log('Login failed:', res.status, await res.text());
        return null;
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.log('Failed to login:', err);
      return null;
    }
  },  

  logout: async () => {
    try {
      await fetch('/api/registered-users/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.log('Failed to logout:', err);
    }
  },

  approve: async (email) => {
    try {
      await fetch('/api/registered-users/approve', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.log('Failed to approve user:', err);
    }
  },

  reject: async (email) => {
    try {
      await fetch('/api/registered-users/reject', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      console.log('Failed to reject user:', err);
    }
  },

  list: async () => {
    try {
      const res = await fetch('/api/registered-users', {
        method: 'GET',
        credentials: 'include' 
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.log('Failed to list users:', err);
      return [];
    }
  },
};
