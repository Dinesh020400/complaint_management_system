import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllUsers, getAllComplaints, deleteUser, registerUser } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import ResetPassword from "./ResetPassword";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userComplaints, setUserComplaints] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);
  const usersPerPage = 5;

  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDoorNumber, setNewUserDoorNumber] = useState('');
  const [addUserError, setAddUserError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Load users and their complaints from API
    const fetchUsersAndComplaints = async () => {
      try {
        setLoading(true);

        // Fetch all users
        const usersResponse = await getAllUsers();
        if (usersResponse.data) {
          setUsers(usersResponse.data);

          // Initialize empty complaints object
          const complaintsByUser = {};
          usersResponse.data.forEach(user => {
            complaintsByUser[user._id] = [];
          });

          // Fetch all complaints
          const complaintsResponse = await getAllComplaints();
          if (complaintsResponse.data) {
            // Group complaints by user
            complaintsResponse.data.forEach(complaint => {
              if (complaint.user && complaint.user._id) {
                if (!complaintsByUser[complaint.user._id]) {
                  complaintsByUser[complaint.user._id] = [];
                }
                complaintsByUser[complaint.user._id].push(complaint);
              }
            });
          }

          setUserComplaints(complaintsByUser);
        }
      } catch (error) {
        console.error('Error fetching users and complaints:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchUsersAndComplaints();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const toggleUserExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Delete user function
  const handleDeleteUser = async (userId) => {
    try {
      // Confirm deletion with warning about complaints
      if (!window.confirm('Warning: Deleting this user will also delete all their complaints. Are you sure you want to proceed?')) {
        return;
      }

      setLoading(true);
      const response = await deleteUser(userId);

      if (response && response.data) {
        // Remove user from state
        setUsers(users.filter(user => user._id !== userId));

        // Remove user's complaints from state
        const updatedComplaints = { ...userComplaints };
        delete updatedComplaints[userId];
        setUserComplaints(updatedComplaints);

        alert('User and all associated complaints deleted successfully');
      } else {
        setError('Failed to delete user. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.msg || 'Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add new user function
  const addUser = async (e) => {
    e.preventDefault();
    setAddUserError('');

    // Validate form
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserDoorNumber) {
      setAddUserError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        doorNumber: newUserDoorNumber
      });

      if (response && response.data) {
        // Add new user to state
        setUsers([...users, response.data.user]);

        // Reset form
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserDoorNumber('');
        setShowAddUserForm(false);

        alert('User added successfully');
      } else {
        setAddUserError('Failed to add user. Please try again.');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setAddUserError(err.response?.data?.msg || 'Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg font-medium text-gray-700">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/admin/AdminDashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto">
      <header className="w-full bg-white shadow-md z-10 fixed top-0 left-0 right-0">
        <div className="w-full px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
          </div>
          <div className="flex items-center">
            <div className="relative admin-dropdown">
              <button
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
              >
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-20">
        <aside className="w-36 bg-white shadow-lg fixed h-[calc(100vh-5rem)] left-0 top-20 overflow-y-auto">
          <nav className="px-2 py-4 space-y-3">
            <a href="/admin/AdminDashboard" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <a href="/admin/complaints" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Complaints
            </a>
            <a href="/admin/users" className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-900 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </a>
          </nav>
        </aside>

        <main className="flex-1 ml-36 p-6 bg-white">
          <div className="w-full space-y-6">
            <div className="bg-white shadow-lg rounded-lg">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Manage Users</h3>
                <button
                  onClick={() => setShowAddUserForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New User
                </button>
              </div>

              {showAddUserForm && (
                <div className="p-6 border-b bg-gray-50">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Add New User</h4>
                  <form onSubmit={addUser} className="space-y-4">
                    {addUserError && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-md">
                        {addUserError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="newUserName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="newUserName"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Name"
                        />
                      </div>

                      <div>
                        <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="newUserEmail"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Email"
                        />
                      </div>

                      <div>
                        <label htmlFor="newUserPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          id="newUserPassword"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label htmlFor="newUserDoorNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment Door Number
                        </label>
                        <input
                          type="text"
                          id="newUserDoorNumber"
                          value={newUserDoorNumber}
                          onChange={(e) => setNewUserDoorNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Door Number"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddUserForm(false);
                          setNewUserName('');
                          setNewUserEmail('');
                          setNewUserPassword('');
                          setNewUserDoorNumber('');
                          setAddUserError('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add User
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {selectedUserForReset && (
                <div className="p-6 border-b">
                  <ResetPassword
                    userId={selectedUserForReset._id}
                    userEmail={selectedUserForReset.email}
                    onSuccess={() => setSelectedUserForReset(null)}
                  />
                  <button
                    onClick={() => setSelectedUserForReset(null)}
                    className="mt-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Door Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Complaints
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((user) => (
                      <React.Fragment key={user._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.doorNumber || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                {user.name ? user.name.charAt(0) : (user.email ? user.email.charAt(0) : '?')}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                                <div className="text-sm text-gray-500">{user.role || 'user'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {userComplaints[user._id] ? userComplaints[user._id].length : 0} Complaints
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleUserExpand(user._id)}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors duration-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {expandedUser === user._id ? "Hide" : "View"}
                              </button>
                              <button
                                onClick={() => setSelectedUserForReset(user)}
                                className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors duration-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Reset
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete user ${user.name || user.email}? This action cannot be undone.`)) {
                                    handleDeleteUser(user._id);
                                  }
                                }}
                                className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors duration-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedUser === user._id && userComplaints[user._id] && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-md font-medium text-gray-700 mb-2">Complaints by {user.name || user.email || 'User'}</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 border">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Door Number</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {userComplaints[user._id].map(complaint => (
                                        <tr key={complaint._id} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{user.doorNumber || 'Not specified'}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">{complaint.title}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{complaint.category}</td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              complaint.status && complaint.status.toLowerCase() === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : complaint.status && complaint.status.toLowerCase() === 'in-progress'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : complaint.status && complaint.status.toLowerCase() === 'resolved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                              {complaint.status
                                                ? complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).toLowerCase().replace('-', ' ')
                                                : 'Unknown'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-xs">
                                            <Link
                                              to={`/admin/complaints/${complaint._id}`}
                                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors duration-200"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                              View
                                            </Link>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700 mb-4 sm:mb-0">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span> pages
                    </p>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {/* Pagination buttons */}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageUsers;