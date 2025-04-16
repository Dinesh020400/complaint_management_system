import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api, { getAllComplaints } from '../../services/api';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const { user, logout } = useContext(AuthContext) || {};
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken && parsedToken.user) {
          setUserData(parsedToken.user);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        // Use the API service instead of direct axios calls
        // For regular users, use getUserComplaints instead of getAllComplaints
        const { getUserComplaints } = await import('../../services/api');
        const response = await getUserComplaints();
        setComplaints(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setError('Failed to fetch complaints. Please try again.');
        setLoading(false);
        if (error.response && error.response.status === 401) {
          if (logout) logout();
        }
      }
    };

    if (user) {
      fetchComplaints();
    } else {
      setLoading(false);
      setError('Please log in to view your dashboard');
    }
  }, [user, logout]);

  // Status updates are only allowed for admins, not regular users

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesFilter = filter === 'all' || complaint.status === filter;
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <header className="w-full bg-white shadow-md z-10 fixed top-0 left-0 right-0">
        <div className="w-full px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
          </div>
          <div className="flex items-center">
            <div className="relative user-dropdown">
              <button
                onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
              >
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                  {userData && userData.name ? userData.name.charAt(0) : 'U'}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">{userData && userData.name}</span>
                  {userData && userData.doorNumber && (
                    <span className="text-xs text-gray-500">Apartment: {userData.doorNumber}</span>
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
            <Link to="/dashboard" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-900 text-white">
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
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800">Complaints Management</h3>
                {userData && (
                  <p className="text-gray-600 mt-1">
                    Welcome, <span className="font-medium">{userData.name || userData.email}</span>
                    {userData.doorNumber && (
                      <span className="ml-2 text-sm text-gray-500">Apartment: {userData.doorNumber}</span>
                    )}
                  </p>
                )}
              </div>

              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('pending')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setFilter('in-progress')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setFilter('resolved')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'resolved' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      Resolved
                    </button>
                    <button
                      onClick={() => setFilter('rejected')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      Rejected
                    </button>
                    <button
                      onClick={() => setFilter('closed')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'closed' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                      Closed
                    </button>
                  </div>
                  <div className="w-full md:w-64">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search complaints..."
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Door Number</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                {complaint.user && complaint.user.name ? complaint.user.name.charAt(0) : '?'}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{complaint.user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {complaint.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                            {complaint.status === 'in-progress' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                In Progress
                              </span>
                            )}
                            {complaint.status === 'resolved' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Resolved
                              </span>
                            )}
                            {complaint.status === 'rejected' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Rejected
                              </span>
                            )}
                            {complaint.status === 'closed' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Closed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewComplaint(complaint)}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors duration-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>

                              {complaint.status && complaint.status.toLowerCase() === 'pending' && (
                                <Link
                                  to={`/complaints/${complaint._id}/edit`}
                                  className="inline-flex items-center px-3 py-1.5 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition-colors duration-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </Link>
                              )}

                              {complaint.status && complaint.status.toLowerCase() === 'resolved' && (
                                <Link
                                  to={`/complaints/${complaint._id}/payment`}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors duration-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  Pay ₹{complaint.paymentAmount || '0'}
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No complaints found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

        {/* Complaint Detail Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Complaint Details</h3>
                      <div className="mb-4">
                        <h4 className="text-xl font-bold">{selectedComplaint.title}</h4>
                        <p className="text-sm text-gray-500">
                          Submitted by {selectedComplaint.user.name} on{' '}
                          {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700">Description:</h5>
                        <p className="mt-1 text-gray-800">{selectedComplaint.description}</p>
                      </div>
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700">Current Status:</h5>
                        <span
                          className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedComplaint.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : selectedComplaint.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : selectedComplaint.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : selectedComplaint.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1)}
                        </span>
                      </div>
                      {/* Status update removed - only admins can update status */}
                      {selectedComplaint.status && selectedComplaint.status.toLowerCase() === 'pending' && (
                        <div className="mb-4 border-t pt-4 mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Actions Available:</h5>
                          <div className="flex flex-col space-y-2">
                            <Link
                              to={`/complaints/${selectedComplaint._id}/edit`}
                              className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Edit This Complaint
                            </Link>
                            <p className="text-sm text-gray-500">
                              You can edit this complaint because it is still in pending status.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Dashboard;