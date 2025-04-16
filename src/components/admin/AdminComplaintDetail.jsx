import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getComplaintByIdAdmin, updateComplaintStatusAdmin } from '../../services/api';

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentField, setShowPaymentField] = useState(false);

  // Add a new state to track if update was successful
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch complaint from API
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const response = await getComplaintByIdAdmin(id);
        const complaintData = response.data;

        if (complaintData) {
          setComplaint(complaintData);
          setStatus(complaintData.status || 'pending');
          setAdminResponse(complaintData.adminComments || '');
        }
      } catch (error) {
        console.error('Error fetching complaint:', error);
        setError('Failed to fetch complaint details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchComplaint();
    } else {
      navigate('/login');
    }
  }, [id, user, navigate]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    // Show payment field if status is resolved
    if (newStatus === 'resolved') {
      setShowPaymentField(true);
      setShowPaymentPopup(true);
    } else {
      setShowPaymentField(false);
      setPaymentAmount('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare the update data
      const updateData = {
        status,
        adminComments: adminResponse
      };

      // Add payment amount if status is resolved
      if (status === 'resolved' && paymentAmount) {
        updateData.paymentAmount = parseFloat(paymentAmount);
        updateData.paymentStatus = 'pending';
      }

      // Call the API to update the complaint
      const response = await updateComplaintStatusAdmin(id, updateData);

      if (response.data) {
        // Update the local state to reflect changes
        setComplaint(response.data.complaint);
        setUpdateSuccess(true);

        // Show success message
        setTimeout(() => {
          navigate('/admin/complaints');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Failed to update complaint. Please try again.');
      setUpdateSuccess(false);
    }
  };

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.admin-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

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
          onClick={() => navigate('/admin/complaints')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Complaints
        </button>
      </div>
    );
  }

  if (updateSuccess) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Complaint updated successfully!</p>
        </div>
        <p className="text-gray-600 mb-4">Redirecting to complaints list...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Complaint Not Found</h2>
        <p className="text-gray-600 mb-6">The complaint you're looking for doesn't exist or has been removed.</p>
        <Link to="/admin/complaints" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Back to Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto relative">
      <header className="w-full bg-white shadow-md z-10 fixed top-0 left-0 right-0">
        <div className="w-full px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="flex items-center">
            <div className="relative admin-dropdown">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
              >
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
                <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150"
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
        <aside className="w-48 bg-white shadow-lg fixed h-[calc(100vh-5rem)] left-0 top-20 overflow-y-auto">
          <nav className="px-3 py-4 space-y-3">
            <Link to="/admin/AdminDashboard" className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link to="/admin/complaints" className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-gray-900 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              All Complaints
            </Link>
            <Link to="/admin/users" className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Users
            </Link>
          </nav>
        </aside>

        <main className="flex-1 ml-48 p-8 bg-white">
          <div className="w-full space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Complaint Details</h2>
                <p className="text-sm text-gray-500">Door Number: {complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}</p>
              </div>
              <Link to="/admin/complaints" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Complaints
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Complaint Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Complaint Information</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Title</h4>
                      <p className="text-lg font-medium text-gray-900">{complaint.title}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Category</h4>
                      <p className="text-md text-gray-800">{complaint.category}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                      <p className="text-md text-gray-800 whitespace-pre-line">{complaint.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Date Submitted</h4>
                      <p className="text-md text-gray-800">{new Date(complaint.createdAt).toLocaleString()}</p>
                    </div>

                    {complaint.paymentAmount > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Payment Amount</h4>
                        <p className="text-md text-gray-800 font-semibold">₹{complaint.paymentAmount || '0'}</p>
                      </div>
                    )}

                    {complaint.paymentStatus && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Payment Status</h4>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complaint.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {complaint.paymentStatus === 'completed' ? 'Paid' : 'Pending Payment'}
                          </span>

                          {complaint.paymentStatus === 'completed' && complaint.paymentDetails && (
                            <div className="ml-4 mt-3 p-3 bg-green-50 border border-green-100 rounded-md w-full">
                              <h4 className="text-sm font-medium text-green-800 mb-2">Payment Details</h4>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Amount Paid:</p>
                                  <p className="text-sm text-green-700 font-medium">₹{complaint.paymentDetails.amount}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Transaction ID:</p>
                                  <p className="text-sm text-gray-700">{complaint.paymentDetails.transactionId}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Cardholder Name:</p>
                                  <p className="text-sm text-gray-700">{complaint.paymentDetails.cardholderName || 'Not provided'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Payment Method:</p>
                                  <p className="text-sm text-gray-700">{complaint.paymentDetails.paymentMethod} (**** {complaint.paymentDetails.cardLastFour})</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Payment Date:</p>
                                  <p className="text-sm text-gray-700">{new Date(complaint.paymentDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Payment Time:</p>
                                  <p className="text-sm text-gray-700">{new Date(complaint.paymentDate).toLocaleTimeString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Apartment:</p>
                                  <p className="text-sm text-gray-700">{complaint.paymentDetails.doorNumber || (complaint.user && complaint.user.doorNumber) || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Status:</p>
                                  <p className="text-sm text-green-700 font-medium">Completed</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}



                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Submitted By</h4>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                          {complaint.user && complaint.user.name ? complaint.user.name.charAt(0) : '?'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{complaint.user && complaint.user.name ? complaint.user.name : 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{complaint.user && complaint.user.email ? complaint.user.email : 'No email'}</p>
                          <p className="text-sm text-gray-500 font-medium">
                            Apartment: {complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {complaint.attachments && complaint.attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Attachments</h4>
                        <div className="flex flex-wrap gap-4">
                          {complaint.attachments.map((attachment, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <img
                                src={attachment}
                                alt={`Attachment ${index + 1}`}
                                className="w-32 h-32 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Information & Status Update */}
              <div className="space-y-6">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">User Information</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-medium">
                        {complaint.user && complaint.user.name ? complaint.user.name.charAt(0) : '?'}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-md font-medium text-gray-900">{complaint.user && complaint.user.name ? complaint.user.name : 'Unknown User'}</h4>
                        <p className="text-sm text-gray-500">{complaint.user && complaint.user.email ? complaint.user.email : 'No email'}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-1">User ID:</p>
                      <p className="text-md text-gray-800">{complaint.user && complaint.user._id ? complaint.user._id : 'Not available'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-1">Apartment:</p>
                      <p className="text-md text-gray-800">{complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Status Update</h3>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Status
                        </label>
                        <select
                          id="status"
                          value={status}
                          onChange={handleStatusChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {showPaymentField && (
                        <div className="mt-4">
                          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Amount (Required for Resolved Status)
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                              type="number"
                              name="paymentAmount"
                              id="paymentAmount"
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                              placeholder="0.00"
                              step="0.01"
                              min="1"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              required={status === 'resolved'}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">INR</span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Enter the amount to be paid by the user.</p>
                        </div>
                      )}

                      <div>
                        <label htmlFor="adminResponse" className="block text-sm font-medium text-gray-700 mb-1">
                          Admin Comments
                        </label>
                        <textarea
                          id="adminResponse"
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your response to the user..."
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Update Complaint
                      </button>
                    </form>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Set Payment Amount</h3>
              <button
                onClick={() => setShowPaymentPopup(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              You are changing the status to <span className="font-semibold text-green-600">Resolved</span>. Please set the payment amount that the user needs to pay.
            </p>
            <div className="mb-4">
              <label htmlFor="popupPaymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount (₹)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="popupPaymentAmount"
                  id="popupPaymentAmount"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                  step="0.01"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">INR</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPaymentPopup(false);
                  if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
                    setStatus('in-progress');
                    setShowPaymentField(false);
                  }
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (paymentAmount && parseFloat(paymentAmount) > 0) {
                    setShowPaymentPopup(false);
                  } else {
                    alert('Please enter a valid payment amount greater than 0');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaintDetail;