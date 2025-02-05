import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/auth.service';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  login: () => Promise.resolve(),
  logout: () => {},
  register: () => Promise.resolve()
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount and token changes
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Parse user data safely
        let parsedUser;
        try {
          parsedUser = JSON.parse(userData);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const verifyData = await response.json();
          const updatedUser = { ...parsedUser, ...verifyData.user };
          
          setUser(updatedUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('token', verifyData.token);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext; 