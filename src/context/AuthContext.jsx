import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { loginUser, registerUser, verifyToken } from '../services/api';

// Create the authentication context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Check if user is authenticated on initial load - only run once
  useEffect(() => {
    const loadUser = async () => {
      // Get token from localStorage to ensure we have the latest value
      const currentToken = localStorage.getItem('token');

      if (currentToken) {
        try {
          // Set the token in API headers
          api.setAuthToken(currentToken);

          // Get current user data
          const res = await verifyToken();

          if (res.data && res.data.success) {
            setUser(res.data.user);
          } else {
            throw new Error('Failed to verify token');
          }
        } catch (err) {
          // If token is invalid, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          api.setAuthToken(null);
          setToken(null);
          setUser(null);
          setError('Authentication failed. Please login again.');
        }
      }

      // Always set loading to false when done
      setLoading(false);
    };

    loadUser();
    // Empty dependency array means this effect runs once on mount
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await registerUser(userData);

      // Set token and user in local storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Set token in state and API headers
      setToken(res.data.token);
      api.setAuthToken(res.data.token);

      // Set user in state
      setUser(res.data.user);

      // Redirect based on user role
      const isAdmin = res.data.user.role === 'admin' ||
                     (res.data.user.email && res.data.user.email.includes('admin'));

      // Determine the target path based on user role
      const targetPath = isAdmin ? '/admin/AdminDashboard' : '/dashboard';
      console.log('AuthContext register - Redirecting to:', targetPath);

      // Navigate to the appropriate dashboard
      navigate(targetPath, { replace: true });

      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      console.log('AuthContext login - Attempting login with:', credentials);
      const res = await loginUser(credentials);
      console.log('AuthContext login - Login response:', res);

      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error('Invalid login response');
      }

      // Ensure user has a role
      if (!res.data.user.role) {
        console.log('AuthContext login - User has no role, defaulting to "user"');
        res.data.user.role = 'user';
      }

      // Special case for admin@gmail.com
      if (credentials.email && credentials.email.includes('admin')) {
        console.log('AuthContext login - Admin email detected, setting role to admin');
        res.data.user.role = 'admin';
      }

      console.log('AuthContext login - User role:', res.data.user.role);

      // Set token and user in local storage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Set token in state and API headers
      setToken(res.data.token);
      api.setAuthToken(res.data.token);

      // Set user in state
      setUser(res.data.user);

      // Redirect based on user role
      const isAdmin = res.data.user.role === 'admin' ||
                     (res.data.user.email && res.data.user.email.includes('admin'));

      // Determine the target path based on user role
      const targetPath = isAdmin ? '/admin/AdminDashboard' : '/dashboard';
      console.log('AuthContext login - Redirecting to:', targetPath);

      // Navigate to the appropriate dashboard
      navigate(targetPath, { replace: true });

      setLoading(false);
      return true;
    } catch (err) {
      console.error('AuthContext login - Error:', err);

      // Provide more specific error messages based on the error type
      if (err.response) {
        // The server responded with an error status
        const status = err.response.status;
        const errorData = err.response.data;

        if (status === 400) {
          // Check if there's a hint in the error response
          const errorMsg = errorData.hint
            ? `${errorData.msg}. ${errorData.hint}`
            : "Invalid email or password. Please check your credentials and try again.";
          setError(errorMsg);
        } else if (status === 401 || status === 403) {
          setError("You are not authorized to access this resource.");
        } else if (status === 429) {
          setError("Too many login attempts. Please try again later.");
        } else if (status >= 500) {
          setError("Server error. Please try again later.");
        } else if (errorData && errorData.msg) {
          setError(errorData.msg);
        } else {
          setError("An error occurred during login. Please try again.");
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("Network error. Please check your internet connection and try again.");
      } else {
        // Something happened in setting up the request
        setError(err.message || "An unexpected error occurred. Please try again.");
      }

      setLoading(false);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    console.log('AuthContext - Logging out user');

    try {
      // Remove token and user from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Remove token from API headers
      api.setAuthToken(null);

      // Clear user and token from state
      setToken(null);
      setUser(null);

      // Redirect to login page with replace to prevent back navigation
      console.log('AuthContext - Redirecting to login page');
      navigate('/login', { replace: true });

      // Return true to indicate successful logout
      return true;
    } catch (error) {
      console.error('AuthContext - Error during logout:', error);

      // Final fallback - use window.location for direct navigation
      window.location.href = '/login';

      // Return false to indicate error during logout
      return false;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        token,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;