import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function getStoredUser() {
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    return null;
  }
}

export const getDashboardPath = (role) => {
  switch (role) {
    case "Admin":
      return "/admin/dashboard";

    case "Developer":
      return "/developer/dashboard";

    case "Client":
      return "/client/dashboard";

    default:
      return "/";
  }
};

export const getLoginPath = (role) => {
  switch (role) {
    case "Admin":
      return "/admin/login";

    case "Developer":
      return "/developer/login";

    case "Client":
      return "/client/login";

    default:
      return "/";
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token') || sessionStorage.getItem('token'));
  
  // 1. Add the loading indicator state to manage initialization delay
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Perform an initial session check on boot
    const verifySession = async () => {
      try {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUserData = getStoredUser();

        if (storedToken && storedUserData) {
          setToken(storedToken);
          setUser(storedUserData);
        } else {
          // No token found, clear down cleanly
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        // 3. Drop the loading gate so ProtectedRoutes can safely route the user
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = (userData, authToken, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    
    // Clear legacy instances
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Save updated credentials
    storage.setItem('user', JSON.stringify(userData));
    storage.setItem('token', authToken);
    
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;