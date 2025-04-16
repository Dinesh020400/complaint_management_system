import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // No pattern, just using a clean theme
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState(null);

    // Get auth context
    const authContext = useContext(AuthContext);
    const { login, error } = authContext || {};
    const navigate = useNavigate();

    // We'll let the AuthContext handle navigation after login
    // This prevents circular redirections
    useEffect(() => {
        // Clear any previous errors when component mounts
        setLoginError(null);
        setFormErrors({});
    }, []);

    useEffect(() => {
        if (error) {
            setLoginError(error);
        }
    }, [error]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        let errors = {};
        let isValid = true;

        // Clear any previous general errors
        setLoginError(null);

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email address is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            setLoginError(null); // Clear any previous errors
            setFormErrors({}); // Clear form errors

            try {
                // First try the context login if available
                if (login) {
                    console.log('Using context login function');
                    const success = await login(formData);
                    if (success) {
                        console.log('Context login successful');
                        return; // Exit early if successful
                    }
                } else {
                    // Fallback to direct API call if login function is not available
                    try {
                        // Try login method
                        console.log('Attempting login with:', formData);

                        // Use the regular login
                        const { loginUser } = await import('../../services/api');
                        console.log('Using regular login endpoint');

                        const loginResponse = await loginUser(formData);
                        console.log('Login response:', loginResponse);

                        if (loginResponse.data && loginResponse.data.token) {
                            // Store token and user data
                            localStorage.setItem('token', loginResponse.data.token);
                            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));

                            // Show success message
                            setLoginError(null);

                            // Redirect based on user role
                            console.log('Login successful - User role:', loginResponse.data.user.role);

                            // Special case for admin emails
                            const isAdmin = loginResponse.data.user.role === 'admin' ||
                                           (loginResponse.data.user.email && loginResponse.data.user.email.includes('admin'));

                            if (isAdmin) {
                                console.log('Redirecting admin user to /admin/AdminDashboard');
                                // Force role to be admin
                                loginResponse.data.user.role = 'admin';
                                // Update localStorage
                                localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
                                navigate('/admin/AdminDashboard');
                            } else {
                                console.log('Redirecting regular user to /dashboard');
                                navigate('/dashboard');
                            }
                            return;
                        }
                    } catch (loginError) {
                        console.error('Login failed:', loginError);

                        // Check for specific error types
                        if (loginError.response) {
                            // Server responded with an error status
                            const status = loginError.response.status;
                            const errorData = loginError.response.data;

                            if (status === 400) {
                                // Invalid credentials
                                // Check if there's a hint in the error response
                                const errorMsg = errorData.hint
                                    ? `${errorData.msg}. ${errorData.hint}`
                                    : "Invalid email or password. Please check your credentials and try again.";

                                setFormErrors({
                                    ...formErrors,
                                    general: errorMsg
                                });
                            } else if (status === 401 || status === 403) {
                                // Unauthorized
                                setFormErrors({
                                    ...formErrors,
                                    general: "You are not authorized to access this resource."
                                });
                            } else if (status === 429) {
                                // Too many requests
                                setFormErrors({
                                    ...formErrors,
                                    general: "Too many login attempts. Please try again later."
                                });
                            } else if (status >= 500) {
                                // Server error
                                setFormErrors({
                                    ...formErrors,
                                    general: "Server error. Please try again later."
                                });
                            } else if (errorData && errorData.msg) {
                                // Server provided a specific error message
                                setFormErrors({
                                    ...formErrors,
                                    general: errorData.msg
                                });
                            }
                        } else if (loginError.request) {
                            // Request was made but no response received (network error)
                            setFormErrors({
                                ...formErrors,
                                general: "Network error. Please check your internet connection and try again."
                            });
                        } else {
                            // Fallback error message
                            setFormErrors({
                                ...formErrors,
                                general: "Login failed. Please check your credentials and try again."
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Login error:', err);

                // Handle different types of errors
                let errorMessage = 'Login failed. Please try again.';

                if (err.response) {
                    // Server responded with an error status
                    const status = err.response.status;
                    const errorData = err.response.data;

                    if (status === 400) {
                        errorMessage = "Invalid email or password. Please check your credentials and try again.";
                    } else if (status === 401 || status === 403) {
                        errorMessage = "You are not authorized to access this resource.";
                    } else if (status === 429) {
                        errorMessage = "Too many login attempts. Please try again later.";
                    } else if (status >= 500) {
                        errorMessage = "Server error. Please try again later.";
                    } else if (errorData && errorData.msg) {
                        errorMessage = errorData.msg;
                    }
                } else if (err.request) {
                    // Request was made but no response received (network error)
                    errorMessage = "Network error. Please check your internet connection and try again.";
                } else if (err.message) {
                    // Something else happened while setting up the request
                    errorMessage = err.message;
                }

                // Set the error message in the form
                setFormErrors({
                    ...formErrors,
                    general: errorMessage
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="auth-page flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-2xl border border-gray-200 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent opacity-5 pointer-events-none h-20"></div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-extrabold text-black">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-gray-600">Please sign in to your account</p>
                </div>

                {(loginError || formErrors.general) && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-4">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{loginError || formErrors.general}</span>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm`}
                            />
                            {formErrors.email && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <svg className="h-3 w-3 text-red-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formErrors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`appearance-none relative block w-full px-4 py-3 border ${
                                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                                } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm`}
                            />
                            {formErrors.password && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <svg className="h-3 w-3 text-red-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {formErrors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                            isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>

                    <p className="text-sm text-center">
                        Don’t have an account?{' '}
                        <a href="/register" className="font-medium text-black hover:text-gray-700 transition duration-150 ease-in-out">
                            Register
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
