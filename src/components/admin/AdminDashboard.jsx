import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getAllComplaints, getComplaintStats } from '../../services/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext) || {};

  // Get admin data from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken && parsedToken.user && parsedToken.user.role === 'admin') {
          setAdminData(parsedToken.user);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('AdminDashboard - Current user:', user);

        // Skip fetching data if user is not logged in or not admin
        // We'll handle redirects outside of this function
        if (!user || user.role !== 'admin') {
          console.log('AdminDashboard - User not authenticated or not admin');
          setLoading(false);
          return;
        }

        console.log('AdminDashboard - User is admin, proceeding to fetch data');

        // Fetch complaints using our API service
        const complaintsResponse = await getAllComplaints();
        setComplaints(complaintsResponse.data);

        // Try to fetch stats if available
        try {
          console.log('Fetching complaint stats...');
          const statsResponse = await getComplaintStats();
          console.log('Stats response:', statsResponse.data);

          if (statsResponse.data) {
            setStats(statsResponse.data);
          }
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          console.log('Stats not available, using complaint data for stats');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);

        // If unauthorized, don't show error message, just logout
        if (err.response && err.response.status === 401) {
          console.log('AdminDashboard - Unauthorized, logging out');
          if (logout) logout();
        } else {
          // Only set error for non-authentication issues
          setError(err.message || 'Failed to fetch data');
        }

        setLoading(false);
      }
    };

    fetchData();
  }, [user, logout]);

  // If loading, show loading indicator
  if (loading) return <div>Loading dashboard...</div>;

  // If not logged in, redirect to login page
  if (!user) {
    console.log('AdminDashboard - No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If not admin, redirect to user dashboard
  if (user && user.role !== 'admin') {
    console.log('AdminDashboard - User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If there's an error but user is logged in and is admin, show the error
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const handleLogout = () => {
    // Simple and reliable logout method
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto">
      <header className="w-full bg-white shadow-md z-10 fixed top-0 left-0 right-0">
        <div className="w-full px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center">
            <div className="relative admin-dropdown">
              <button
                onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
              >
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                  {adminData && adminData.name ? adminData.name.charAt(0) : 'A'}
                </div>
                <span className="text-sm font-medium text-gray-700">{adminData && adminData.name ? adminData.name : 'Admin'}</span>
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
                      window.location.href = '/login';
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
            <Link to="/admin/AdminDashboard" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-900 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link to="/admin/complaints" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Complaints
            </Link>
            <Link to="/admin/users" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </Link>
          </nav>
        </aside>

        <main className="flex-1 ml-36 p-6 bg-white">
          <div className="w-full space-y-6">
            <div className="bg-white shadow-lg rounded-lg">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-800">Admin Dashboard</h3>
                {adminData && (
                  <p className="text-gray-600 mt-1">
                    Welcome, <span className="font-medium">{adminData.name || adminData.email}</span>
                  </p>
                )}
              </div>



              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Complaints Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">Total</h4>
                    <p className="text-2xl font-bold">{stats ? stats.totalComplaints : complaints.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">Pending</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats ? stats.pending : complaints.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">In Progress</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats ? stats.inProgress : complaints.filter(c => c.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">Resolved</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {stats ? stats.resolved : complaints.filter(c => c.status === 'resolved').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">Rejected</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {stats ? stats.rejected : complaints.filter(c => c.status === 'rejected').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow transition-shadow">
                    <h4 className="text-gray-500 text-sm font-medium mb-2">Closed</h4>
                    <p className="text-2xl font-bold text-gray-600">
                      {stats ? stats.closed : complaints.filter(c => c.status === 'closed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/admin/complaints" className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-black text-white mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Manage Complaints</span>
                          <p className="text-sm text-gray-500">View and update complaint statuses</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                  <Link to="/admin/users" className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-black text-white mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Manage Users</span>
                          <p className="text-sm text-gray-500">Add, edit, or remove user accounts</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Complaints</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Door Number</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {complaints.slice(0, 5).map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{complaint.title}</td>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/admin/complaints/${complaint._id}`} className="text-black hover:text-gray-700 transition-colors">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {complaints.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                            No complaints found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {complaints.length > 5 && (
                  <div className="mt-4 text-right">
                    <Link to="/admin/complaints" className="inline-flex items-center text-sm font-medium text-black hover:text-gray-700 transition-colors">
                      View all complaints
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


export default AdminDashboard;
