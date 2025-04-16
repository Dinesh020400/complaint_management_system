import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// User Components
import Dashboard from './components/dashboard/Dashboard';
import NewComplaint from './components/complaint/NewComplaint';
import ComplaintDetail from './components/complaint/ComplaintDetail';
import EditComplaint from './components/complaint/EditComplaint';
import MyComplaints from './components/complaint/MyComplaints';
import PaymentPage from './components/payment/PaymentPage';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminComplaintDetail from './components/admin/AdminComplaintDetail';
import ManageUsers from './components/admin/ManageUsers';
import AdminComplaints from './components/admin/AdminComplaints';
// AdminReports component removed

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          setLoading(false);
          return;
        }

        // Set the user from localStorage first for immediate UI response
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
        }

        // Import the API function and verify with server
        const { verifyToken, setAuthToken } = await import('./services/api');

        // Set the token in API headers
        setAuthToken(token);

        // Verify the token with the server
        const response = await verifyToken();

        if (response.data && response.data.success) {
          // Update user with fresh data from server
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          throw new Error('Invalid session');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Define ProtectedRoute outside of the App component to prevent re-creation on every render
  const ProtectedRoute = ({ children, requiredRole }) => {
    // Directly check permissions without using local state
    if (loading) {
      return <div className="text-center mt-20 text-lg">Loading...</div>;
    }

    // Get user from localStorage to avoid dependency on App component state
    // This prevents circular dependencies in the render cycle
    const storedUser = localStorage.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;

    console.log('ProtectedRoute - User from localStorage:', userObj);
    console.log('ProtectedRoute - Required role:', requiredRole);

    if (!userObj) {
      // Not logged in, redirect to login
      console.log('ProtectedRoute - No user, redirecting to login');
      // Use replace to prevent back navigation to protected route
      return <Navigate to="/login" replace={true} />;
    }

    // For admin routes, check if user is admin
    if (requiredRole === 'admin') {
      console.log('ProtectedRoute - Admin route check:', userObj.role);

      // Special case for admin emails
      const isAdmin = userObj.role === 'admin' || (userObj.email && userObj.email.includes('admin'));

      if (!isAdmin) {
        console.log('ProtectedRoute - User is not admin, redirecting to dashboard');
        return <Navigate to="/dashboard" replace={true} />;
      } else if (userObj.role !== 'admin') {
        // Force role to be admin if email contains 'admin'
        console.log('ProtectedRoute - Forcing admin role for user with admin email');
        userObj.role = 'admin';
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    }

    // For user routes, check if user is either user or admin (admins can access user routes)
    if (requiredRole === 'user') {
      console.log('ProtectedRoute - User route check:', userObj.role);
      if (userObj.role !== 'user' && userObj.role !== 'admin') {
        console.log('ProtectedRoute - User is neither user nor admin, redirecting to login');
        return <Navigate to="/login" replace={true} />;
      }
    }

    // User has appropriate permissions
    console.log('ProtectedRoute - User has appropriate permissions');
    return children;
  };

  // Define HomeRoute to prevent infinite loops
  const HomeRoute = () => {
    if (loading) return <div className="text-center mt-20 text-lg">Loading...</div>;

    // Get user from localStorage to avoid dependency on App component state
    const storedUser = localStorage.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;

    console.log('HomeRoute - User from localStorage:', userObj);

    // Determine the target path based on user role
    let targetPath = '/login';

    if (userObj) {
      console.log('HomeRoute - User role:', userObj.role);

      // Special case for admin emails
      const isAdmin = userObj.role === 'admin' || (userObj.email && userObj.email.includes('admin'));

      if (isAdmin) {
        // Make sure admin users go to the admin dashboard
        targetPath = '/admin/AdminDashboard';
        console.log('HomeRoute - Admin user, setting target path to:', targetPath);

        // Force role to be admin if email contains 'admin'
        if (userObj.role !== 'admin') {
          console.log('HomeRoute - Forcing admin role for user with admin email');
          userObj.role = 'admin';
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      } else {
        // Regular users go to the user dashboard
        targetPath = '/dashboard';
        console.log('HomeRoute - Regular user, setting target path to:', targetPath);
      }
    }

    // Always redirect to the appropriate path
    console.log('HomeRoute - Redirecting to:', targetPath);
    return <Navigate to={targetPath} replace={true} />;
  };

  // Define AuthRoute to prevent infinite loops
  const AuthRoute = ({ component: Component }) => {
    if (loading) return <div className="text-center mt-20 text-lg">Loading...</div>;

    // Get user from localStorage to avoid dependency on App component state
    const storedUser = localStorage.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;

    console.log('AuthRoute - User from localStorage:', userObj);

    // If user is authenticated, redirect to the appropriate dashboard
    if (userObj) {
      console.log('AuthRoute - User role:', userObj.role);

      // Special case for admin emails
      const isAdmin = userObj.role === 'admin' || (userObj.email && userObj.email.includes('admin'));

      // Determine the target path based on user role
      const targetPath = isAdmin ? '/admin/AdminDashboard' : '/dashboard';
      console.log('AuthRoute - User role:', userObj.role, 'Is admin:', isAdmin, 'Target path:', targetPath);

      // Force role to be admin if email contains 'admin'
      if (isAdmin && userObj.role !== 'admin') {
        console.log('AuthRoute - Forcing admin role for user with admin email');
        userObj.role = 'admin';
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(userObj));
      }

      // Always redirect to the appropriate dashboard
      console.log('AuthRoute - Redirecting to:', targetPath);
      return <Navigate to={targetPath} replace={true} />;
    }

    // If not authenticated, render the component (login or register)
    console.log('AuthRoute - Not authenticated, rendering component');
    return <Component />;
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<AuthRoute component={Login} />} />
          <Route path="/register" element={<AuthRoute component={Register} />} />

          {/* User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/new-complaint" element={
            <ProtectedRoute requiredRole="user">
              <NewComplaint />
            </ProtectedRoute>
          } />
          <Route path="/complaints/:id" element={
            <ProtectedRoute requiredRole="user">
              <ComplaintDetail />
            </ProtectedRoute>
          } />
          <Route path="/complaints/:id/edit" element={
            <ProtectedRoute requiredRole="user">
              <EditComplaint />
            </ProtectedRoute>
          } />
          <Route path="/my-complaints" element={
            <ProtectedRoute requiredRole="user">
              <MyComplaints />
            </ProtectedRoute>
          } />
          <Route path="/complaints/:id/payment" element={
            <ProtectedRoute requiredRole="user">
              <PaymentPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/AdminDashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/complaints" element={
            <ProtectedRoute requiredRole="admin">
              <AdminComplaints />
            </ProtectedRoute>
          } />
          <Route path="/admin/complaints/:id" element={
            <ProtectedRoute requiredRole="admin">
              <AdminComplaintDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <ManageUsers />
            </ProtectedRoute>
          } />
          {/* AdminReports route removed */}

          {/* 404 Not Found */}
          <Route path="*" element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">Page not found</p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
