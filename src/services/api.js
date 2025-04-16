import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Function to set auth token in headers
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Also set x-auth-token for backward compatibility
    API.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete API.defaults.headers.common['Authorization'];
    delete API.defaults.headers.common['x-auth-token'];
  }
};

// Add auth token to requests if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Also set x-auth-token for backward compatibility
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Handle response errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error);

    // Handle token expiration or auth errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      // Handle authentication errors
      if (status === 401 || status === 403) {
        // Clear local storage on auth errors
        if (errorData.message === 'Not authorized, token failed' ||
            errorData.message === 'Not authorized as an admin' ||
            errorData.msg === 'Token is not valid') {
          console.log('Auth error detected, logging out');
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Only redirect if not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }

      // Add more descriptive information to the error
      if (errorData) {
        error.userMessage = errorData.msg || errorData.message || 'An error occurred';
      }
    } else if (error.request) {
      // The request was made but no response was received
      error.userMessage = 'Network error. Please check your internet connection.';
    } else {
      // Something happened in setting up the request
      error.userMessage = error.message || 'An unexpected error occurred';
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getCurrentUser = () => API.get('/auth/user');
export const verifyToken = () => API.get('/auth/verify');

// Debug function to help troubleshoot API calls
export const debugLogin = async (credentials) => {
  console.log('Debug login with credentials:', credentials);
  try {
    // Make a direct fetch call to see the raw response
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    console.log('Debug login response:', data);
    return data;
  } catch (error) {
    console.error('Debug login error:', error);
    throw error;
  }
};

// Test login function that uses the test-login endpoint
export const testLogin = async (credentials) => {
  console.log('Test login with credentials:', credentials);
  try {
    // Make a direct fetch call to the test login endpoint
    const response = await fetch('http://localhost:5000/api/auth/test-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    console.log('Test login response:', data);
    return data;
  } catch (error) {
    console.error('Test login error:', error);
    throw error;
  }
};

// Direct login function that bypasses password check (for testing only)
export const directLogin = async (credentials) => {
  console.log('Direct login with credentials:', credentials);
  try {
    // Make a direct fetch call to the direct login endpoint
    const response = await fetch('http://localhost:5000/api/auth/direct-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    console.log('Direct login response:', data);
    return data;
  } catch (error) {
    console.error('Direct login error:', error);
    throw error;
  }
};

// Complaint API calls
// Get all complaints (for admin)
export const getComplaints = () => API.get('/complaints');
// Get current user's complaints
export const getUserComplaints = async () => {
  console.log('Fetching user complaints');
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Set authorization header explicitly for this request
    const config = {
      headers: {}
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await API.get('/complaints', config);
    console.log('User complaints fetch response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    throw error;
  }
};
// Get complaint by ID
export const getComplaintById = async (id) => {
  console.log(`Fetching complaint with ID: ${id}`);
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Set authorization header explicitly for this request
    const config = {
      headers: {}
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await API.get(`/complaints/${id}`, config);
    console.log('Complaint fetch response:', response);
    return response;
  } catch (error) {
    console.error(`Error fetching complaint with ID ${id}:`, error);
    throw error;
  }
};
// Create new complaint
export const createComplaint = (complaintData) => API.post('/complaints', complaintData);
// Update complaint
export const updateComplaint = async (id, complaintData) => {
  console.log(`Updating complaint with ID: ${id}`);
  console.log('Update data:', complaintData);
  try {
    const response = await API.put(`/complaints/${id}`, complaintData);
    console.log('Complaint update response:', response);
    return response;
  } catch (error) {
    console.error(`Error updating complaint with ID ${id}:`, error);
    throw error;
  }
};
// Update complaint status
export const updateComplaintStatus = (id, statusData) => API.put(`/complaints/${id}`, statusData);

// Delete complaint by ID
export const deleteComplaintById = async (id) => {
  console.log(`Deleting complaint with ID: ${id}`);
  try {
    const response = await API.delete(`/complaints/${id}`);
    console.log('Complaint delete response:', response);
    return response;
  } catch (error) {
    console.error(`Error deleting complaint with ID ${id}:`, error);
    throw error;
  }
};
// Process payment for a complaint
export const processPayment = async (id, paymentData) => {
  console.log(`Processing payment for complaint ID: ${id}`);
  console.log('Payment data:', paymentData);
  try {
    const response = await API.post(`/complaints/${id}/payment`, paymentData);
    console.log('Payment response:', response);
    return response;
  } catch (error) {
    console.error(`Error processing payment for complaint ID ${id}:`, error);
    throw error;
  }
};

// Delete complaint
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);

// Admin API calls
export const getAllComplaints = () => API.get('/admin/complaints');
export const getComplaintByIdAdmin = (id) => API.get(`/admin/complaints/${id}`);
export const updateComplaintStatusAdmin = async (id, statusData) => {
  console.log(`Updating complaint status with ID: ${id}`);
  console.log('Status update data:', statusData);
  try {
    const response = await API.put(`/admin/complaints/${id}`, statusData);
    console.log('Complaint status update response:', response);
    return response;
  } catch (error) {
    console.error(`Error updating complaint status with ID ${id}:`, error);
    throw error;
  }
};
export const deleteComplaintAdmin = (id) => API.delete(`/admin/complaints/${id}`);
export const getAllUsers = () => API.get('/admin/users');
export const getUserById = (id) => API.get(`/admin/users/${id}`);
export const updateUserRole = (id, roleData) => API.put(`/admin/users/${id}`, roleData);
export const resetUserPassword = (id, passwordData) => API.put(`/admin/users/${id}/reset-password`, passwordData);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getComplaintStats = () => API.get('/admin/stats');
export const getMonthlyStats = () => API.get('/admin/stats/monthly');

// Add setAuthToken to API object
API.setAuthToken = setAuthToken;

// Export API instance
export default API;
