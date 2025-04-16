import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API, { createComplaint } from '../../services/api';

const NewComplaint = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = [
        'Plumbing Issue',
        'Electrical Problem',
        'HVAC System',
        'Appliance Repair',
        'Pest Control',
        'Noise Complaint',
        'Common Area Maintenance',
        'Security Concern',
        'Parking Issue',
        'Structural Damage',
        'Water Leakage',
        'Internet/Cable Service',
        'Other'
    ];

    const priorities = ['low', 'medium', 'high'];

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        if (!title || !description || !category) {
            setError('Please fill all required fields');
            setIsSubmitting(false);
            return;
        }

        if (!user) {
            setError('You must be logged in to submit a complaint');
            setIsSubmitting(false);
            return;
        }

        // Make sure we have the auth token set
        const token = localStorage.getItem('token');
        if (token) {
            // Set the auth token in the API headers
            API.setAuthToken(token);
            console.log('Auth token set for complaint submission');
        } else {
            console.warn('No auth token found in localStorage');
        }

        const complaintData = {
            title,
            description,
            category,
            priority,
            user: user._id, // Include user ID explicitly
            doorNumber: user.doorNumber // Include door number explicitly
        };

        try {
            // Use the API service to create a complaint
            const response = await createComplaint(complaintData);

            setSuccess('Complaint submitted successfully!');
            // Reset form after successful submission
            setTitle('');
            setDescription('');
            setCategory('');
            setPriority('medium');

            // Redirect to dashboard page after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            console.error('Error submitting complaint:', err);
            setError(
                err.response?.data?.msg ||
                'Failed to submit complaint. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add state for logout dropdown
    const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);

    return (
        <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto">
            {/* Header */}
            <header className="w-full bg-white shadow-md z-10 fixed top-0 left-0 right-0">
                <div className="w-full px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-800">New Complaint</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="relative user-dropdown">
                            <button
                                onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                            >
                                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                                    {user && user.name ? user.name.charAt(0) : 'U'}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-gray-700">{user && user.name}</span>
                                    {user && user.doorNumber && (
                                        <span className="text-xs text-gray-500">Apartment: {user.doorNumber}</span>
                                    )}
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {showLogoutDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('user');
                                            navigate('/login');
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 pt-20">
                <aside className="w-36 bg-white shadow-lg fixed h-[calc(100vh-5rem)] left-0 top-20 overflow-y-auto">
                    <nav className="px-2 py-4 space-y-3">
                        <Link to="/dashboard" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </Link>
                        <Link to="/my-complaints" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            My Complaints
                        </Link>
                        <Link to="/new-complaint" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-900 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Complaint
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-36 p-6 bg-white">
                    <div className="w-full space-y-6">
                        <div className="bg-white shadow-lg rounded-lg">
                            <div className="p-6 border-b">
                                <h3 className="text-xl font-semibold text-gray-800">Submit New Complaint</h3>
                            </div>
                            <div className="p-6">

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            <i className="fas fa-check-circle mr-2"></i>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="category"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="priority">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    {priorities.map((p) => (
                                        <option key={p} value={p}>
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm h-32"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 space-x-3">
                            <button
                                type="button"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                onClick={() => navigate(-1)}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className={`bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 ${
                                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NewComplaint;
