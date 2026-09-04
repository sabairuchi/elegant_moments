import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'elegant_moments_auth_token';
const USER_STORAGE_KEY = 'elegant_moments_auth_user';

const safeParseJson = async (res, defaultMessage = 'Request failed.') => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      throw new Error('Invalid JSON response received from server.');
    }
  }
  if (res.status === 404) {
    throw new Error('API route not found (404). Please ensure server endpoints are deployed and running.');
  }
  throw new Error(`${defaultMessage} (HTTP ${res.status})`);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) || null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync token to API headers & verify me endpoint on load
  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await safeParseJson(res, 'Authentication check failed');
          if (data && data.success && data.user) {
            setUser(data.user);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify authentication session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await safeParseJson(res, 'Login failed');
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed.');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    return data;
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await safeParseJson(res, 'Registration failed');
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const verifyEmail = async (verificationToken) => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verificationToken }),
    });
    const data = await safeParseJson(res, 'Verification failed');
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Verification failed.');
    }
    if (user && user.id === data.user.id) {
      setUser(data.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    }
    return data;
  };

  const resendVerification = async (email) => {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeParseJson(res, 'Resend verification failed');
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Resend verification failed.');
    }
    return data;
  };

  const forgotPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await safeParseJson(res, 'Password reset request failed');
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  };

  const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword, confirmPassword }),
    });
    const data = await safeParseJson(res, 'Password reset failed');
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Password reset failed.');
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
