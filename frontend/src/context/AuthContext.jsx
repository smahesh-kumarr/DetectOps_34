import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({ id: decoded.id, role: decoded.role, token });
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, role, id) => {
    localStorage.setItem('token', token);
    setUser({ id, role, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
