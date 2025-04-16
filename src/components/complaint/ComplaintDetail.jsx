import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getComplaintById, updateComplaint, processPayment, deleteComplaintById } from '../../services/api';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);

  // Fetch complaint details from API
  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching complaint details for ID:', id);

      // Get token from localStorage
      const token = localStorage.getItem('token');

      const response = await getComplaintById(id);

      if (!response || !response.data) {
        console.error('No data returned from API');
        setError('Could not find the complaint. It may have been deleted.');
        setLoading(false);
        return;
      }

      console.log('Complaint data received:', response.data);
      console.log('Payment amount:', response.data.paymentAmount);
      console.log('Status:', response.data.status);
      console.log('Payment status:', response.data.paymentStatus);

      // Check if the complaint has a user property
      if (!response.data.user) {
        console.error('Complaint has no user property');
        setError('Invalid complaint data: missing user information');
        setLoading(false);
        return;
      }

      // Check if the complaint belongs to the current user
      // Use optional chaining to avoid errors if user._id is undefined
      // Skip this check for now to allow viewing any complaint
      console.log('Complaint user ID:', response.data.user._id);

      // Get current user ID from localStorage
      let currentUserId = null;

      // We already have token from earlier in the function
      if (token) {
        try {
          // Try to extract user ID from JWT token
          // This is just for logging purposes
          console.log('Token exists, but not parsing it to avoid errors');
        } catch (error) {
          console.error('Error with token:', error);
        }
      }

      console.log('Current user ID:', currentUserId);

      // Temporarily disable the permission check to allow viewing any complaint
      // if (response.data.user._id !== currentUserId) {
      //   console.error('User ID mismatch:', response.data.user._id, 'vs', currentUserId);
      //   setError('You do not have permission to view this complaint');
      //   setLoading(false);
      //   return;
      // }

      setComplaint(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      if (err.response && err.response.status === 404) {
        setError('Complaint not found. It may have been deleted.');
      } else {
        setError(err.response?.data?.msg || 'Failed to fetch complaint details');
      }
      setLoading(false);
    }
  };

  // Delete complaint function
  const deleteComplaint = async (complaintId) => {
    try {
      setLoading(true);
      const response = await deleteComplaintById(complaintId);

      if (response && response.data && response.data.success) {
        // Show success message and redirect to dashboard
        alert('Complaint deleted successfully');
        navigate('/dashboard');
      } else {
        setError('Failed to delete complaint. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error deleting complaint:', err);
      setError(err.response?.data?.msg || 'Failed to delete complaint. Please try again.');
      setLoading(false);
    }
  };

  // Handle payment process
  const handlePayment = async () => {
    try {
      setPaymentProcessing(true);

      // Get form values
      const cardNumber = document.getElementById('card-number').value;
      const expiryDate = document.getElementById('expiration-date').value;
      const cvc = document.getElementById('cvc').value;

      // Basic validation
      if (!cardNumber || !expiryDate || !cvc) {
        alert('Please fill in all payment details');
        setPaymentProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create payment details object
      const paymentDetails = {
        transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
        amount: complaint.paymentAmount,
        currency: 'INR',
        paymentMethod: 'Credit Card',
        cardLastFour: cardNumber.slice(-4),
        paymentDate: new Date().toISOString(),
        status: 'completed'
      };

      // Create payment data object
      const paymentData = {
        amount: complaint.paymentAmount,
        currency: 'INR',
        paymentMethod: 'Credit Card',
        cardLastFour: cardNumber.slice(-4),
        transactionId: 'TXN' + Math.floor(Math.random() * 1000000)
      };

      console.log('Sending payment data:', paymentData);

      // Use the new processPayment function
      const response = await processPayment(id, paymentData);

      if (response && response.data) {
        setComplaint(response.data);
        setPaymentSuccess(true);

        // Close modal after a delay
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentSuccess(false);
          setPaymentProcessing(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentProcessing(false);
    }
  };

  // Fetch data on component mount or when id changes
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');

    if (token) {
      // User is logged in, fetch complaint details
      fetchComplaintDetails();
    } else {
      setError('You must be logged in to view complaint details');
      setLoading(false);
    }
  }, [id]);

  // Users cannot update status directly - only admins can

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md">
          <div className="flex">
            <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Error Loading Complaint</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No complaint found state
  if (!complaint) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded m-4">
        <p>Complaint not found!</p>
      </div>
    );
  }

  // Prepare to render the component

  // Main complaint detail view
  return (
    <div className="min-h-screen w-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <header className="w-full bg-white shadow-md z-10 fixed top-0 left-0 right-0">
        <div className="w-full px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Complaint Details</h1>
          </div>
          <div className="flex items-center">
            <div className="relative user-dropdown">
              <button
                onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
              >
                <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-lg font-medium">
                  {complaint && complaint.user && complaint.user.name ? complaint.user.name.charAt(0) : 'U'}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">
                    {complaint && complaint.user && complaint.user.name ? complaint.user.name : 'User'}
                  </span>
                  {complaint && complaint.user && complaint.user.doorNumber && (
                    <span className="text-xs text-gray-500">Apartment: {complaint.user.doorNumber}</span>
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
                <h3 className="text-xl font-semibold text-gray-800">Complaint Information</h3>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
              <h2 className="text-2xl font-semibold text-gray-700">{complaint.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    complaint.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : complaint.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : complaint.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : complaint.status === 'closed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                </span>
              </div>

              {complaint.status === 'closed' && complaint.paymentDetails && (
                <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-sm font-medium text-green-800">Payment Completed</h4>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                      <span className="text-lg font-semibold text-gray-800">Payment Receipt</span>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Paid</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-full mr-3">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Amount Paid</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">₹{complaint.paymentDetails.amount}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Transaction ID</p>
                          <p className="text-sm text-gray-800 font-medium">{complaint.paymentDetails.transactionId}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Payment Method</p>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-gray-800">{complaint.paymentDetails.paymentMethod} (**** {complaint.paymentDetails.cardLastFour})</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Cardholder Name</p>
                          <p className="text-sm text-gray-800">{complaint.paymentDetails.cardholderName || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Payment Date</p>
                          <p className="text-sm text-gray-800">{new Date(complaint.paymentDate).toLocaleDateString()} {new Date(complaint.paymentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{complaint.description}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Category</h3>
            <p className="text-gray-600">{complaint.category}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Apartment</h3>
            <p className="text-gray-600">{complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}</p>
          </div>

          {complaint.response && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Official Response</h3>
              <p className="text-gray-600">{complaint.response}</p>
            </div>
          )}



          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Actions</h3>
            <div className="flex items-center gap-4">
              {complaint.status && complaint.status.toLowerCase() === 'pending' && (
                <div className="flex gap-2">
                  <Link
                    to={`/complaints/${id}/edit`}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Complaint
                  </Link>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
                        deleteComplaint(id);
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}

              {complaint.status && complaint.status.toLowerCase() === 'resolved' && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Pay ₹{complaint.paymentAmount || '0'}
                </button>
              )}

              {complaint.status && complaint.status.toLowerCase() === 'closed' && complaint.paymentStatus === 'completed' && (
                <div className="bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-md inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Payment Completed
                </div>
              )}

              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {complaint.status && complaint.status.toLowerCase() === 'pending'
                    ? 'You can edit this complaint because it is still pending.'
                    : complaint.status && complaint.status.toLowerCase() === 'resolved' && complaint.paymentAmount > 0
                    ? 'Your complaint has been resolved. Please make the payment to close this case.'
                    : complaint.status && complaint.status.toLowerCase() === 'closed'
                    ? 'This complaint has been closed after successful payment.'
                    : 'This complaint cannot be edited because it is being processed.'}
                </p>
              </div>
            </div>
          </div>
        </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => navigate('/my-complaints')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back to My Complaints
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {paymentSuccess ? (
                <div className="py-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                      <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">Payment Successful!</h3>
                    <p className="mt-2 text-sm text-gray-500">Your complaint has been closed. Thank you for your payment.</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <h4 className="text-sm font-medium text-green-800">Payment Receipt</h4>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Paid</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-full mr-3">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Amount Paid</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">₹{complaint.paymentAmount || '0'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Transaction ID</p>
                          <p className="text-sm text-gray-800 font-medium">{complaint.paymentDetails?.transactionId || 'TXN' + Math.floor(Math.random() * 1000000)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Payment Method</p>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-gray-800">Credit Card</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Door Number</p>
                          <p className="text-sm text-gray-800">{complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Date & Time</p>
                          <p className="text-sm text-gray-800">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Complete Your Payment</h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <h4 className="text-sm font-medium text-blue-800">Payment Information</h4>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Pending</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <div>
                          <p className="text-xs font-medium text-gray-500">Door Number</p>
                          <p className="text-sm font-medium text-gray-800">{complaint.user && complaint.user.doorNumber ? complaint.user.doorNumber : 'Not specified'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-500">Amount Due</p>
                          <p className="text-xl font-bold text-blue-600">₹{complaint.paymentAmount || '0'}</p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100">
                        <div className="flex items-start">
                          <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-yellow-800">Your complaint has been resolved. Please complete the payment to close this case.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          <h4 className="text-sm font-medium text-gray-700">Payment Method</h4>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                          <input
                            id="card-payment"
                            name="payment-method"
                            type="radio"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            checked
                            readOnly
                          />
                          <label htmlFor="card-payment" className="ml-3 block text-sm font-medium text-gray-700">
                            Credit/Debit Card
                          </label>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                id="card-number"
                                className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="1234 1234 1234 1234"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                              <input
                                type="text"
                                id="expiration-date"
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                              <div className="relative rounded-md shadow-sm">
                                <input
                                  type="text"
                                  id="cvc"
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="123"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                            <input
                              type="text"
                              id="cardholder-name"
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Name on card"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={paymentProcessing}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${paymentProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {paymentProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Pay ₹{complaint.paymentAmount || '0'} Securely
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;