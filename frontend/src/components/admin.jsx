import React, { useState, useEffect } from "react";
import {
  Search,
  LogOut,
  Package,
  CreditCard,
  Filter,
  CheckSquare,
  Mail,
  XCircle,
} from "lucide-react";
import PendingOrders from "../Pages/PendingOrders";
import PendingPass from "../Pages/PendingPass";
import ApprovedOrders from "../Pages/ApprovedOrders";
import QuickActions from "../Pages/QuickActions";

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [passOrders, setPassOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailModalData, setEmailModalData] = useState(null);
  const [userDetailsCache, setUserDetailsCache] = useState({});

  const API_BASE = "https://abhitime.credenz.co.in";

  // Email Modal Component
  const EmailModal = ({ username, onClose, onSend }) => {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const handleSend = async () => {
      if (!subject.trim() || !content.trim()) {
        setError("Please fill in both subject and content");
        return;
      }

      setSending(true);
      setError("");

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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
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
                <span>{sending ? "Sending..." : "Send Email"}</span>
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

  // Fetch regular orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/viewAllOrders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
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
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setPassOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching pass orders:", error);
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
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setApprovedOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching approved orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Approve regular order
  const approveOrder = async (orderID) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/admin/approveOrder/${orderID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ orderID }),
          credentials: "include",
        },
      );

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error approving order:", error);
    }
  };

  // Decline regular order
  const declineOrder = async (orderID) => {
    if (!confirm("Are you sure you want to decline this order?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/admin/declineOrder/${orderID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ orderID }),
          credentials: "include",
        },
      );

      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error declining order:", error);
    }
  };

  // Approve pass order
  const approvePassOrder = async (orderID) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/approvePassOrder/${orderID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ orderID }),
          credentials: "include",
        },
      );

      if (response.ok) {
        fetchPassOrders();
      }
    } catch (error) {
      console.error("Error approving pass order:", error);
    }
  };

  // Decline pass order
  const declinePassOrder = async (id) => {
    if (!confirm("Are you sure you want to decline this pass order?")) return;

    try {
      const response = await fetch(`${API_BASE}/admin/declinePassOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ id }),
        credentials: "include",
      });

      if (response.ok) {
        fetchPassOrders();
      }
    } catch (error) {
      console.error("Error declining pass order:", error);
    }
  };

  // Quick register user
  const quickRegisterUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ user: userData }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("User registered successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  // Buy pass for user
  const buyPassForUser = async (username, transactionID) => {
    try {
      const response = await fetch(`${API_BASE}/admin/buyPass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ username, transactionID }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Pass purchased successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Purchase failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  // Create order for user
  const createOrderForUser = async (orderData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(orderData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Order created successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Order creation failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  // Send email to user
  const sendEmail = async (subject, content, username) => {
    try {
      const response = await fetch(`${API_BASE}/admin/sendEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ subject, content, username }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Email sent successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Failed to send email" };
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  // Get user details
  const getUserDetails = async (username) => {
    if (userDetailsCache[username]) {
      return userDetailsCache[username];
    }

    try {
      const response = await fetch(`${API_BASE}/admin/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ user: { username } }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok && data.user) {
        setUserDetailsCache((prev) => ({ ...prev, [username]: data.user }));
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    onLogout();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "passes") {
      fetchPassOrders();
    } else if (activeTab === "approved") {
      fetchApprovedOrders();
    }
  }, [activeTab]);

  // FIXED: Filter orders based on search - NOW INCLUDES EVENT SLUG & TRANSACTION ID
  const filteredOrders = orders.filter(([orderID, order]) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      orderID.toLowerCase().includes(searchLower) ||
      order.orderItems.some(
        (item) =>
          item.teamname.toLowerCase().includes(searchLower) ||
          item.username1.toLowerCase().includes(searchLower) ||
          item.eventSlug.toLowerCase().includes(searchLower) ||
          item.transactionID.toLowerCase().includes(searchLower), // ADDED TRANSACTION ID SEARCH
      );
    return matchesSearch;
  });

  const filteredPassOrders = passOrders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.orderID.toLowerCase().includes(searchLower) ||
      order.username1.toLowerCase().includes(searchLower) ||
      order.teamname.toLowerCase().includes(searchLower) ||
      order.transactionID.toLowerCase().includes(searchLower); // ADDED TRANSACTION ID SEARCH
    return matchesSearch;
  });

  // FIXED: Filter approved orders - NOW INCLUDES EVENT SLUG & TRANSACTION ID
  const filteredApprovedOrders = approvedOrders.filter(([orderID, order]) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      orderID.toLowerCase().includes(searchLower) ||
      order.orderItems.some(
        (item) =>
          item.teamname.toLowerCase().includes(searchLower) ||
          item.username1.toLowerCase().includes(searchLower) ||
          item.eventSlug.toLowerCase().includes(searchLower) ||
          item.transactionID.toLowerCase().includes(searchLower), // ADDED TRANSACTION ID SEARCH
      );
    return matchesSearch;
  });

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
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Panel
                </h1>
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
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              onClick={() => setActiveTab("passes")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === "passes"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              onClick={() => setActiveTab("approved")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === "approved"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4" />
                <span>Approved Orders</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("quick-actions")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === "quick-actions"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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

      {/* Search Bar - UPDATED PLACEHOLDER */}
      {activeTab !== "quick-actions" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID, Team Name, Username, Event, or Transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() =>
                activeTab === "orders"
                  ? fetchOrders()
                  : activeTab === "passes"
                    ? fetchPassOrders()
                    : fetchApprovedOrders()
              }
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
        ) : activeTab === "orders" ? (
          <PendingOrders
            orders={filteredOrders}
            onApprove={approveOrder}
            onDecline={declineOrder}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : activeTab === "passes" ? (
          <PendingPass
            orders={filteredPassOrders}
            onApprove={approvePassOrder}
            onDecline={declinePassOrder}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : activeTab === "approved" ? (
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

export default AdminPanel;
