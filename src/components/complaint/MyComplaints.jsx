import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getUserComplaints } from '../../services/api';

// Status Badge Component
const StatusBadge = ({ status }) => {
    let colorClass = "";
    let displayStatus = status;

    switch(status.toLowerCase()) {
        case "pending":
            colorClass = "bg-yellow-100 text-yellow-800";
            displayStatus = "Pending";
            break;
        case "in-progress":
            colorClass = "bg-blue-100 text-blue-800";
            displayStatus = "In Progress";
            break;
        case "resolved":
            colorClass = "bg-green-100 text-green-800";
            displayStatus = "Resolved";
            break;
        case "rejected":
            colorClass = "bg-red-100 text-red-800";
            displayStatus = "Rejected";
            break;
        case "closed":
            colorClass = "bg-gray-100 text-gray-800";
            displayStatus = "Closed";
            break;
        default:
            colorClass = "bg-gray-100 text-gray-800";
    }

    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
            {displayStatus}
        </span>
    );
};

// MyComplaints Component
const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                setLoading(true);
                // Make sure we have a token
                const storedToken = localStorage.getItem('token');
                if (!storedToken) {
                    navigate('/login');
                    return;
                }

                // Use the API service to fetch user complaints
                const response = await getUserComplaints();
                console.log('Fetched complaints:', response.data);
                setComplaints(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching complaints:', err);
                setError(err.response?.data?.msg || 'Failed to fetch complaints');
                setLoading(false);
            }
        };

        fetchComplaints();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }

    if (complaints.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No complaints found</h3>
                <p className="mt-1 text-sm text-gray-500">You haven't submitted any complaints yet.</p>
                <div className="mt-6">
                    <Link
                        to="/new-complaint"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Complaint
                    </Link>
                </div>
            </div>
        );
    }

    // Prepare to render the component

    return (
        <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto">
            {/* Header */}
            <header className="w-full bg-white shadow-md z-10 fixed top-0 left-0 right-0">
                <div className="w-full px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-800">My Complaints</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="relative user-dropdown">
                            <button
                                onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                            >
                                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                                    {complaints.length > 0 && complaints[0].user && complaints[0].user.name
                                        ? complaints[0].user.name.charAt(0)
                                        : (token && token.user && token.user.name ? token.user.name.charAt(0) : 'U')}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-gray-700">
                                        {complaints.length > 0 && complaints[0].user && complaints[0].user.name
                                            ? complaints[0].user.name
                                            : (token && token.user && token.user.name ? token.user.name : 'User')}
                                    </span>
                                    {complaints.length > 0 && complaints[0].user && complaints[0].user.doorNumber ? (
                                        <span className="text-xs text-gray-500">Apartment: {complaints[0].user.doorNumber}</span>
                                    ) : (token && token.user && token.user.doorNumber && (
                                        <span className="text-xs text-gray-500">Apartment: {token.user.doorNumber}</span>
                                    ))}
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
                        <Link to="/my-complaints" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-900 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            My Complaints
                        </Link>
                        <Link to="/new-complaint" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
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
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-800">All My Complaints</h3>
                                <Link
                                    to="/new-complaint"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Complaint
                                </Link>
                            </div>

            <div className="p-6">
                <ul className="divide-y divide-gray-200 bg-white shadow overflow-hidden rounded-lg">
                    {complaints.map((complaint) => (
                        <li key={complaint._id}>
                            <Link to={`/complaints/${complaint._id}`} className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-blue-600 truncate">
                                                {complaint.title}
                                            </p>
                                            <p className="mt-1 flex items-center text-sm text-gray-500">
                                                <span className="truncate">Door: {complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}</span>
                                            </p>
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <StatusBadge status={complaint.status} />
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                {complaint.category}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1zm8 0a1 1 0 011 1v14a1 1 0 01-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
export default MyComplaints;