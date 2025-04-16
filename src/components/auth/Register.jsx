import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const Register = () => {
    // No pattern, just using a clean theme
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    doorNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const { login, register } = authContext || {};
  const navigate = useNavigate();

  const { name, email, doorNumber, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (!name || !email || !doorNumber || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (register) {
        // Use the register function from AuthContext
        const success = await register({
          name,
          email,
          doorNumber,
          password
        });

        if (success) {
          // Redirect to dashboard after successful registration
          navigate('/dashboard');
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        // Fallback to direct API call if register function is not available
        const { registerUser } = await import('../../services/api');
        const response = await registerUser({
          name,
          email,
          doorNumber,
          password
        });

        if (response.data && response.data.token) {
          // Store token and user data
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          setError('Registration successful but login failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.msg ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
            className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent opacity-5 pointer-events-none h-20"></div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-black">
            Create Account
          </h2>
          <p className="text-sm text-gray-600">Please fill in your details</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="doorNumber" className="block text-sm font-medium text-gray-700 mb-1">Door Number</label>
              <input
                id="doorNumber"
                name="doorNumber"
                type="text"
                value={doorNumber}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                placeholder="Enter your door number"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </div>

          <p className="text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-black hover:text-gray-700 transition duration-150 ease-in-out">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;