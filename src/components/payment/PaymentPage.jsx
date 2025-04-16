import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getComplaintById, processPayment } from '../../services/api';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        const response = await getComplaintById(id);

        // Check if the complaint is resolved and belongs to the current user
        if (response.data.status !== 'resolved') {
          setError('This complaint is not in resolved status. Payment is only required for resolved complaints.');
          setLoading(false);
          return;
        }

        if (response.data.user._id !== user?.id) {
          setError('You are not authorized to make payment for this complaint.');
          setLoading(false);
          return;
        }

        setComplaint(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching complaint:', err);
        setError('Failed to load complaint details. Please try again later.');
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      setFormError('All fields are required');
      return;
    }

    if (cardNumber.length < 16) {
      setFormError('Invalid card number');
      return;
    }

    if (cvv.length < 3) {
      setFormError('Invalid CVV');
      return;
    }

    try {
      setPaymentProcessing(true);
      setFormError('');

      // Process payment
      const paymentData = {
        amount: complaint.paymentAmount, // Use the amount set by admin
        currency: 'INR',
        paymentMethod: 'card',
        cardholderName: cardName, // Store the cardholder name at the top level
        cardDetails: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardName,
          expiryDate,
          cvv
        }
      };

      const response = await processPayment(id, paymentData);

      if (response.data.success) {
        setPaymentSuccess(true);
        // Wait 3 seconds before redirecting to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setFormError('Payment failed. Please try again.');
      }

      setPaymentProcessing(false);
    } catch (err) {
      console.error('Error processing payment:', err);
      setFormError('Payment processing failed. Please try again later.');
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-xl font-semibold text-gray-800 mb-4">Error</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-xl font-semibold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-center text-gray-600 mb-6">
            Your payment of ₹{complaint.paymentAmount} has been processed successfully. Your complaint status has been updated to 'closed'.
          </p>
          <p className="text-center text-gray-500 mb-6">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <h2 className="text-xl font-bold text-white">Payment for Complaint</h2>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Complaint Details</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Title:</span> {complaint.title}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Category:</span> {complaint.category}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Status:</span> {complaint.status}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Apartment:</span> {user?.doorNumber || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {new Date(complaint.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Payment Amount</h3>
                <span className="text-2xl font-bold text-green-600">₹{complaint.paymentAmount}</span>
              </div>
              <p className="text-sm text-gray-500">
                This payment is for the resolution of your complaint. Once payment is complete, your complaint will be marked as closed.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {formError}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, '');
                      if (input.length <= 4) {
                        let formatted = input;
                        if (input.length > 2) {
                          formatted = input.substring(0, 2) + '/' + input.substring(2);
                        }
                        setExpiryDate(formatted);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123"
                    maxLength="4"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center ${
                    paymentProcessing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {paymentProcessing && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {paymentProcessing ? 'Processing...' : 'Pay ₹' + complaint.paymentAmount}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
