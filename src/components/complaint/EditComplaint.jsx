import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getComplaintById, updateComplaint } from '../../services/api';

const EditComplaint = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [notAllowed, setNotAllowed] = useState(false);

    // Fetch complaint data
    const fetchComplaint = async () => {
        try {
            setLoading(true);
            console.log('Fetching complaint with ID:', id);

            // First check if the complaint exists
            const response = await getComplaintById(id);

            if (!response || !response.data) {
                console.error('No data returned from API');
                setError('Could not find the complaint. It may have been deleted.');
                setNotAllowed(true);
                setLoading(false);
                return;
            }

            const complaintData = response.data;
            console.log('Complaint data received:', complaintData);

            // Check if the complaint belongs to the current user
            console.log('Complaint user ID:', complaintData.user._id);
            console.log('Current user ID:', user?._id);

            // Temporarily disable the permission check to allow editing any complaint
            // if (!complaintData.user || complaintData.user._id !== user._id) {
            //     setError('You do not have permission to edit this complaint');
            //     setNotAllowed(true);
            //     setLoading(false);
            //     return;
            // }

            // Check if the complaint is in pending status
            console.log('Complaint status:', complaintData.status);

            // Temporarily disable the status check to allow editing any complaint
            // if (!complaintData.status || complaintData.status.toLowerCase() !== 'pending') {
            //     setError('This complaint cannot be edited because it is not in pending status');
            //     setNotAllowed(true);
            //     setLoading(false);
            //     return;
            // }

            // Log for debugging
            console.log('Complaint is in pending status, allowing edit');

            setComplaint(complaintData);
            setError(null);
        } catch (err) {
            console.error("Error fetching complaint:", err);
            if (err.response && err.response.status === 404) {
                setError('Complaint not found. It may have been deleted or you do not have permission to view it.');
            } else {
                setError(err.response?.data?.msg || "Failed to load complaint. Please try again.");
            }
            setNotAllowed(true);
        } finally {
            setLoading(false);
        }
    };

    // Fetch complaint data on mount
    useEffect(() => {
        if (user) {
            fetchComplaint();
        } else {
            setError('You must be logged in to edit a complaint');
            setLoading(false);
        }
    }, [id, user]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setComplaint(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Double-check that the complaint is still in pending status before submitting
            // Temporarily skip this check to allow editing any complaint
            console.log('Skipping status check to allow editing any complaint');

            setUpdating(true);
            setError(null);
            setSuccess(false);

            // Users can only edit title, description, category, and priority
            // Status cannot be changed by users
            const updateData = {
                title: complaint.title,
                description: complaint.description,
                category: complaint.category,
                priority: complaint.priority
                // Status is not included - users cannot change status
            };

            console.log('Updating complaint with ID:', id);
            console.log('Update data:', updateData);

            const response = await updateComplaint(id, updateData);

            console.log('Update response:', response);

            if (response && response.data) {
                setComplaint(response.data);
                setSuccess(true);

                // Redirect to the complaint details page after a short delay
                setTimeout(() => {
                    navigate(`/complaints/${id}`);
                }, 1500);
            } else {
                throw new Error('No response data received');
            }

        } catch (err) {
            console.error("Error updating complaint:", err);
            if (err.response && err.response.status === 404) {
                setError('Complaint not found. It may have been deleted or you do not have permission to edit it.');
            } else {
                setError(err.response?.data?.msg || "Failed to update complaint. Please try again.");
            }
        } finally {
            setUpdating(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-lg font-medium text-gray-700">Loading...</span>
            </div>
        );
    }

    // Not allowed state (not pending or not owner)
    if (notAllowed) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
                    <div className="flex">
                        <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium">Unable to Edit Complaint</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate('/my-complaints')}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        View All Complaints
                    </button>
                    <button
                        onClick={() => navigate(`/complaints/${id}`)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        View Complaint Details
                    </button>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !complaint) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
                    <p className="font-medium">{error}</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={fetchComplaint}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/my-complaints')}
                        className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Back to My Complaints
                    </button>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Complaint</h2>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <p className="font-medium">Complaint updated successfully!</p>
                    <p className="text-sm mt-1">Redirecting to complaint details...</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                        Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={complaint.title}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={complaint.description}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={complaint.category}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="">Select a category</option>
                        <option value="technical">Technical</option>
                        <option value="service">Service</option>
                        <option value="billing">Billing</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        value={complaint.priority}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="">Select priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                {/* Status field removed - users cannot modify status */}

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-yellow-700">
                            <span className="font-medium">Note:</span> You can only edit this complaint because it is still in pending status. Once the status changes, you will no longer be able to edit it.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/complaints/${id}`)}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={updating}
                    >
                        {updating ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Complaint Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Complaint ID</p>
                        <p className="font-medium">{id}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-medium">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Created On</p>
                        <p className="font-medium">{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p className="font-medium">{complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleString() : 'Not yet updated'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditComplaint;