import { createContext, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY, apiError } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load: verify the stored token and confirm admin role.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        if (res.data?.role === 'admin') setUser(res.data);
        else localStorage.removeItem(TOKEN_KEY); // logged-in but not an admin
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // Returns the user on success, throws a friendly Error otherwise.
  const login = async (email, password) => {
    let res;
    try {
      res = await api.post('/auth/login', { email, password });
    } catch (err) {
      throw new Error(apiError(err));
    }
    const { token, user: userData } = res.data;

    if (userData?.role !== 'admin') {
      // Never store a customer token in the admin app.
      throw new Error('This account is not an admin. Ask the owner for access.');
    }

    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
