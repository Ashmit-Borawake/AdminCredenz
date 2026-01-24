import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, LogOut, Package, CreditCard, Filter, Mail, CheckSquare } from 'lucide-react';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [passOrders, setPassOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailModalData, setEmailModalData] = useState(null);
  const [userDetailsCache, setUserDetailsCache] = useState({});

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const API_BASE = 'http://localhost:3000'; // Replace with your actual API base URL

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { username, password } }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        fetchOrders();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

// Email Modal Component
const EmailModal = ({ username, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('Please fill in both subject and content');
      return;
    }

    setSending(true);
    setError('');

    const result = await onSend(subject, content, username);

    setSending(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Send Email</h3>
            <p className="text-sm text-gray-500 mt-1">To: {username}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              placeholder="Enter email content"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Mail className="w-4 h-4" />
              <span>{sending ? 'Sending...' : 'Send Email'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Approved Orders Component
const ApprovedOrders = ({ orders, onSendEmail, getUserDetails }) => {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [userDetails, setUserDetails] = useState({});

  const toggleOrderExpansion = async (orderID, username) => {
    const isExpanding = !expandedOrders[orderID];
    setExpandedOrders(prev => ({ ...prev, [orderID]: isExpanding }));

    if (isExpanding && !userDetails[username]) {
      const details = await getUserDetails(username);
      if (details) {
        setUserDetails(prev => ({ ...prev, [username]: details }));
      }
    }
  };
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No approved orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map(([orderID, order]) => {
        const username = order.orderItems[0].username1;
        const isExpanded = expandedOrders[orderID];
        const user = userDetails[username];

        return (
          <div key={orderID} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order ID: {orderID}</h3>
                    <button
                      onClick={() => toggleOrderExpansion(orderID, username)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      {isExpanded ? '▼ Hide Details' : '▶ Show User Details'}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Original: <span className="font-semibold text-gray-900">₹{order.originalOrderValue}</span>
                    </span>
                    <span className="text-gray-600">
                      Final: <span className="font-semibold text-green-600">₹{order.finalOrderValue}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Approved
                    </span>
                  </div>

                  {/* User Details */}
                  {isExpanded && user && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">College</p>
                          <p className="font-medium text-gray-900">{user.collegeName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {isExpanded && !user && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">Loading user details...</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onSendEmail(username)}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ml-4"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Event</p>
                        <p className="font-medium text-gray-900">{item.eventSlug}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Team Name</p>
                        <p className="font-medium text-gray-900">{item.teamname}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Price</p>
                        <p className="font-medium text-gray-900">
                          <span className="line-through text-gray-400">₹{item.originalPrice}</span>{' '}
                          <span className="text-green-600">₹{item.finalPrice}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Transaction ID</p>
                        <p className="font-medium text-gray-900 text-sm">{item.transactionID}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase mb-1">Team Members</p>
                      <div className="flex flex-wrap gap-2">
                        {[item.username1, item.username2, item.username3, item.username4]
                          .filter(Boolean)
                          .map((username, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                              {username}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

  // Fetch regular orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/viewAllOrders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pass orders
  const fetchPassOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/viewAllPassOrders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        setPassOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching pass orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved orders
  const fetchApprovedOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/viewAllApprovedOrders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        setApprovedOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching approved orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Approve regular order
  const approveOrder = async (orderID) => {
    try {
      const response = await fetch(`${API_BASE}/admin/approveOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ orderID }),
        credentials: 'include'
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  // Decline regular order
  const declineOrder = async (orderID) => {
    if (!confirm('Are you sure you want to decline this order?')) return;

    try {
      const response = await fetch(`${API_BASE}/admin/declineOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ orderID }),
        credentials: 'include'
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error declining order:', error);
    }
  };

  // Approve pass order
  const approvePassOrder = async (orderID) => {
    try {
      const response = await fetch(`${API_BASE}/admin/approvePassOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ orderID }),
        credentials: 'include'
      });

      if (response.ok) {
        fetchPassOrders();
      }
    } catch (error) {
      console.error('Error approving pass order:', error);
    }
  };

  // Decline pass order
  const declinePassOrder = async (id) => {
    if (!confirm('Are you sure you want to decline this pass order?')) return;

    try {
      const response = await fetch(`${API_BASE}/admin/declinePassOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });

      if (response.ok) {
        fetchPassOrders();
      }
    } catch (error) {
      console.error('Error declining pass order:', error);
    }
  };

  // Quick register user
  const quickRegisterUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ user: userData }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('User registered successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Buy pass for user
  const buyPassForUser = async (username, transactionID) => {
    try {
      const response = await fetch(`${API_BASE}/admin/buyPass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ username, transactionID }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Pass purchased successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Purchase failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Create order for user
  const createOrderForUser = async (orderData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Order created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Order creation failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Send email to user
  const sendEmail = async (subject, content, username) => {
    try {
      const response = await fetch(`${API_BASE}/admin/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ subject, content, username }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Email sent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to send email' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get user details
  const getUserDetails = async (username) => {
    // Check cache first
    if (userDetailsCache[username]) {
      return userDetailsCache[username];
    }

    try {
      const response = await fetch(`${API_BASE}/admin/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({user:{ username }}),
        credentials: 'include'
      });

      const data = await response.json();
      console.log(data)
      if (response.ok && data.user) {
        // Cache the user details
        setUserDetailsCache(prev => ({ ...prev, [username]: data.user }));
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchOrders();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'orders') {
        fetchOrders();
      } else if (activeTab === 'passes') {
        fetchPassOrders();
      } else if (activeTab === 'approved') {
        fetchApprovedOrders();
      }
    }
  }, [activeTab]);

  // Filter orders based on search
  const filteredOrders = orders.filter(([orderID, order]) => {
    const matchesSearch = orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some(item => 
        item.teamname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username1.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  const filteredPassOrders = passOrders.filter(order => {
    const matchesSearch = order.orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.username1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.teamname.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredApprovedOrders = approvedOrders.filter(([orderID, order]) => {
    const matchesSearch = orderID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some(item => 
        item.teamname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username1.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesSearch;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-500 mt-2">Sign in to manage orders</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Enter password"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Order Management System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Pending Orders</span>
                <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                  {orders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('passes')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'passes'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Pending Passes</span>
                <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                  {passOrders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'approved'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4" />
                <span>Approved Orders</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('quick-actions')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'quick-actions'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Quick Actions</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {activeTab !== 'quick-actions' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID, Team Name, or Username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => activeTab === 'orders' ? fetchOrders() : activeTab === 'passes' ? fetchPassOrders() : fetchApprovedOrders()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {successMessage}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : activeTab === 'orders' ? (
          <RegularOrders
            orders={filteredOrders}
            onApprove={approveOrder}
            onDecline={declineOrder}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : activeTab === 'passes' ? (
          <PassOrders
            orders={filteredPassOrders}
            onApprove={approvePassOrder}
            onDecline={declinePassOrder}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : activeTab === 'approved' ? (
          <ApprovedOrders
            orders={filteredApprovedOrders}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : (
          <QuickActions
            onRegister={quickRegisterUser}
            onBuyPass={buyPassForUser}
            onCreateOrder={createOrderForUser}
          />
        )}
      </div>

      {/* Email Modal */}
      {emailModalData && (
        <EmailModal
          username={emailModalData.username}
          onClose={() => setEmailModalData(null)}
          onSend={sendEmail}
        />
      )}
    </div>
  );
};

// Quick Actions Component
const QuickActions = ({ onRegister, onBuyPass, onCreateOrder }) => {
  const [activeForm, setActiveForm] = useState('register');
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const eventOptions = [
    'oss', 'xodia', 'web_weaver', 'wallstreet', 'reverse_coding',
    'roboliga', 'enigma', 'b_plan', 'datawiz', 'cretronix'
  ];

  const handleRegisterSubmit = async () => {
    setFormError('');
    setFormLoading(true);

    const { username, password, email, phoneNumber, firstName, lastName, collegeName, isJunior } = formData;

    if (!username || !password || !email || !phoneNumber || !firstName || !lastName || !collegeName) {
      setFormError('Please fill all required fields');
      setFormLoading(false);
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setFormError('Username must be between 3 and 20 characters');
      setFormLoading(false);
      return;
    }

    if (password.length < 8 || password.length > 20) {
      setFormError('Password must be between 8 and 20 characters');
      setFormLoading(false);
      return;
    }

    if (phoneNumber.length !== 10) {
      setFormError('Phone number must be 10 digits');
      setFormLoading(false);
      return;
    }

    const result = await onRegister({
      username,
      password,
      email,
      phoneNumber,
      firstName,
      lastName,
      collegeName,
      isJunior: isJunior === 'true'
    });

    setFormLoading(false);

    if (result.success) {
      setFormData({});
    } else {
      setFormError(result.error);
    }
  };

  const handleBuyPassSubmit = async () => {
    setFormError('');
    setFormLoading(true);

    const { username, transactionID } = formData;

    if (!username || !transactionID) {
      setFormError('Please fill all required fields');
      setFormLoading(false);
      return;
    }

    const result = await onBuyPass(username, transactionID);

    setFormLoading(false);

    if (result.success) {
      setFormData({});
    } else {
      setFormError(result.error);
    }
  };

  const handleCreateOrderSubmit = async () => {
    setFormError('');
    setFormLoading(true);

    const { username1, username2, username3, username4, eventSlug, teamname, transactionID } = formData;

    if (!username1 || !eventSlug || !teamname || !transactionID) {
      setFormError('Please fill all required fields (username1, eventSlug, teamname, transactionID)');
      setFormLoading(false);
      return;
    }

    const result = await onCreateOrder({
      username1,
      username2: username2 || null,
      username3: username3 || null,
      username4: username4 || null,
      eventSlug,
      teamname,
      transactionID
    });

    setFormLoading(false);

    if (result.success) {
      setFormData({});
    } else {
      setFormError(result.error);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Form Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => { setActiveForm('register'); setFormData({}); setFormError(''); }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              activeForm === 'register'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Register User
          </button>
          <button
            onClick={() => { setActiveForm('buyPass'); setFormData({}); setFormError(''); }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              activeForm === 'buyPass'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Buy Pass
          </button>
          <button
            onClick={() => { setActiveForm('createOrder'); setFormData({}); setFormError(''); }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              activeForm === 'createOrder'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create Order
          </button>
        </div>
      </div>

      {/* Register User Form */}
      {activeForm === 'register' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Register User</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => updateFormData('username', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="3-20 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => updateFormData('password', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="8-20 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateFormData('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="10 digits"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">College Name *</label>
              <input
                type="text"
                value={formData.collegeName || ''}
                onChange={(e) => updateFormData('collegeName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Is Junior? *</label>
              <select
                value={formData.isJunior || 'false'}
                onChange={(e) => updateFormData('isJunior', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          {formError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <button
            onClick={handleRegisterSubmit}
            disabled={formLoading}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formLoading ? 'Registering...' : 'Register User'}
          </button>
        </div>
      )}

      {/* Buy Pass Form */}
      {activeForm === 'buyPass' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Buy Pass for User</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => updateFormData('username', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
              <input
                type="text"
                value={formData.transactionID || ''}
                onChange={(e) => updateFormData('transactionID', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter transaction ID"
              />
            </div>
          </div>

          {formError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <button
            onClick={handleBuyPassSubmit}
            disabled={formLoading}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formLoading ? 'Processing...' : 'Buy Pass'}
          </button>
        </div>
      )}

      {/* Create Order Form */}
      {activeForm === 'createOrder' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Create Event Order</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username 1 (Leader) *</label>
                <input
                  type="text"
                  value={formData.username1 || ''}
                  onChange={(e) => updateFormData('username1', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Team leader username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username 2</label>
                <input
                  type="text"
                  value={formData.username2 || ''}
                  onChange={(e) => updateFormData('username2', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username 3</label>
                <input
                  type="text"
                  value={formData.username3 || ''}
                  onChange={(e) => updateFormData('username3', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username 4</label>
                <input
                  type="text"
                  value={formData.username4 || ''}
                  onChange={(e) => updateFormData('username4', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event *</label>
              <select
                value={formData.eventSlug || ''}
                onChange={(e) => updateFormData('eventSlug', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="">Select an event</option>
                {eventOptions.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Name *</label>
              <input
                type="text"
                value={formData.teamname || ''}
                onChange={(e) => updateFormData('teamname', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
              <input
                type="text"
                value={formData.transactionID || ''}
                onChange={(e) => updateFormData('transactionID', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter transaction ID"
              />
            </div>
          </div>

          {formError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <button
            onClick={handleCreateOrderSubmit}
            disabled={formLoading}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {formLoading ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      )}
    </div>
  );
};

// Regular Orders Component
const RegularOrders = ({ orders, onApprove, onDecline, onSendEmail, getUserDetails }) => {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [userDetails, setUserDetails] = useState({});

  const toggleOrderExpansion = async (orderID, username) => {
    const isExpanding = !expandedOrders[orderID];
    setExpandedOrders(prev => ({ ...prev, [orderID]: isExpanding }));

    if (isExpanding && !userDetails[username]) {
      const details = await getUserDetails(username);
      if (details) {
        setUserDetails(prev => ({ ...prev, [username]: details }));
      }
    }
  };
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No pending orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map(([orderID, order]) => {
        const username = order.orderItems[0].username1;
        const isExpanded = expandedOrders[orderID];
        const user = userDetails[username];

        return (
          <div key={orderID} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order ID: {orderID}</h3>
                    <button
                      onClick={() => toggleOrderExpansion(orderID, username)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {isExpanded ? '▼ Hide Details' : '▶ Show User Details'}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Original: <span className="font-semibold text-gray-900">₹{order.originalOrderValue}</span>
                    </span>
                    <span className="text-gray-600">
                      Final: <span className="font-semibold text-green-600">₹{order.finalOrderValue}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.isApproved ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  {/* User Details */}
                  {isExpanded && user && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">College</p>
                          <p className="font-medium text-gray-900">{user.collegeName}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {isExpanded && !user && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">Loading user details...</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onApprove(orderID)}
                    className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => onDecline(orderID)}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => onSendEmail(username)}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Event</p>
                        <p className="font-medium text-gray-900">{item.eventSlug}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Team Name</p>
                        <p className="font-medium text-gray-900">{item.teamname}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Price</p>
                        <p className="font-medium text-gray-900">
                          <span className="line-through text-gray-400">₹{item.originalPrice}</span>{' '}
                          <span className="text-green-600">₹{item.finalPrice}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Transaction ID</p>
                        <p className="font-medium text-gray-900 text-sm">{item.transactionID}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase mb-1">Team Members</p>
                      <div className="flex flex-wrap gap-2">
                        {[item.username1, item.username2, item.username3, item.username4]
                          .filter(Boolean)
                          .map((username, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                              {username}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Pass Orders Component
const PassOrders = ({ orders, onApprove, onDecline, onSendEmail, getUserDetails }) => {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [userDetails, setUserDetails] = useState({});

  const toggleOrderExpansion = async (orderId, username) => {
    const isExpanding = !expandedOrders[orderId];
    setExpandedOrders(prev => ({ ...prev, [orderId]: isExpanding }));

    if (isExpanding && !userDetails[username]) {
      const details = await getUserDetails(username);
      if (details) {
        setUserDetails(prev => ({ ...prev, [username]: details }));
      }
    }
  };
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No pending pass orders found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => {
        const isExpanded = expandedOrders[order.id];
        const user = userDetails[order.username1];

        return (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Credenz Pass</h3>
                <button
                  onClick={() => toggleOrderExpansion(order.id, order.username1)}
                  className="text-white text-sm hover:text-purple-100"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Order ID</p>
                <p className="font-medium text-gray-900 text-sm">{order.orderID}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase">Username</p>
                <p className="font-medium text-gray-900">{order.username1}</p>
              </div>

              {/* User Details */}
              {isExpanded && user && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Name</p>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-medium text-gray-900 text-xs break-all">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="font-medium text-gray-900">{user.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">College</p>
                      <p className="font-medium text-gray-900">{user.collegeName}</p>
                    </div>
                  </div>
                </div>
              )}
              {isExpanded && !user && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">Loading...</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-gray-500 uppercase">Team Name</p>
                <p className="font-medium text-gray-900">{order.teamname}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Original</p>
                  <p className="font-medium text-gray-900">₹{order.actualPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Paid</p>
                  <p className="font-medium text-green-600">₹{order.pricePaid}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase">Transaction ID</p>
                <p className="font-mono text-xs text-gray-900 break-all">{order.transactionID}</p>
              </div>
              
              <div className="pt-3 border-t border-gray-200 flex space-x-2">
                <button
                  onClick={() => onApprove(order.orderID)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => onDecline(order.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => onSendEmail(order.username1)}
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminPanel;