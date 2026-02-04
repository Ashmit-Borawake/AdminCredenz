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
import api from "../utlils/api";

const AdminPanel = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("approved"); // Default to approved for SUBADMIN
  const [orders, setOrders] = useState([]);
  const [passOrders, setPassOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailModalData, setEmailModalData] = useState(null);
  const [userDetailsCache, setUserDetailsCache] = useState({});
  const [userType, setUserType] = useState("");

  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [loadingPassOrderId, setLoadingPassOrderId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("all");

  // Event list
  const eventOptions = [
    "oss",
    "xodia",
    "web_weaver",
    "wallstreet",
    "reverse_coding",
    "roboliga",
    "enigma",
    "b_plan",
    "datawiz",
    "cretronix",
    "credenz_pass",
  ];

  // Get user type from localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType || "");

    // Set default tab based on user type
    if (storedUserType === "SUBADMIN") {
      setActiveTab("approved");
    }
  }, []);

  // Check if user has access to a tab
  const hasAccess = (tab) => {
    if (userType === "SUBADMIN") {
      return tab === "approved"; // Only approved tab for SUBADMIN
    }
    return true; // Full access for ADMIN
  };

  // Calculate event-wise counts for approved orders
  const getEventCounts = () => {
    const counts = { all: 0 };
    eventOptions.forEach((event) => {
      counts[event] = 0;
    });

    approvedOrders.forEach(([orderID, order]) => {
      order.orderItems.forEach((item) => {
        const eventSlug = item.eventSlug.toLowerCase();
        counts.all++; // Increment total count
        if (counts.hasOwnProperty(eventSlug)) {
          counts[eventSlug]++;
        }
      });
    });

    return counts;
  };

  // Handle event tab click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    if (event === "all") {
      setSearchTerm(""); // Clear search for ALL
    } else {
      setSearchTerm(event); // Set search term to event name
    }
  };

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
      const response = await api.get("/admin/viewAllOrders");
      // console.log(response.data);
      setOrders(response.data.orders || []);
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
      const response = await api.get("/admin/viewAllPassOrders");
      // console.log(response.data);
      setPassOrders(response.data.orders || []);
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
      const response = await api.get("/admin/viewAllApprovedOrders");
      // console.log(response.data);
      setApprovedOrders(response.data.orders || []);
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

    if (!confirmed) return;

    setLoadingOrderId(orderID);

    try {
      await api.post(`/admin/approveOrder/${orderID}`, { orderID });
      fetchOrders();
    } catch (error) {
      console.error("Error approving order:", error);
    } finally {
      setLoadingOrderId(null);
    }
  };

  // Decline regular order
  const declineOrder = async (orderID) => {
    const confirmed = window.confirm(
      "Are you sure you want to decline this order?",
    );

    if (!confirmed) return;

    setLoadingOrderId(orderID);

    try {
      await api.post(`/admin/declineOrder/${orderID}`, { orderID });
      fetchOrders();
    } catch (error) {
      console.error("Error declining order:", error);
    } finally {
      setLoadingOrderId(null);
    }
  };

  // Approve pass order
  const approvePassOrder = async (orderID) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this order?",
    );

    if (!confirmed) return;

    setLoadingPassOrderId(orderID);

    try {
      await api.post(`/admin/approvePassOrder/${orderID}`, { orderID });
      fetchPassOrders();
    } catch (error) {
      console.error("Error approving pass order:", error);
    } finally {
      setLoadingPassOrderId(null);
    }
  };

  // Decline pass order
  const declinePassOrder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to decline this pass order?",
    );

    if (!confirmed) return;

    setLoadingPassOrderId(id);

    try {
      await api.post(`/admin/declinePassOrder/${id}`);
      fetchPassOrders();
    } catch (error) {
      console.error("Error declining pass order:", error);
    } finally {
      setLoadingPassOrderId(null);
    }
  };

  // Quick register user
  const quickRegisterUser = async (userData) => {
    try {
      const response = await api.post("/auth/signup", { user: userData });
      setSuccessMessage("User registered successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      return { success: false, error: errorMessage };
    }
  };

  // Buy pass for user
  const buyPassForUser = async (username, transactionID) => {
    try {
      const response = await api.post("/admin/buyPass", {
        username,
        transactionID,
      });
      setSuccessMessage("Pass purchased successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Purchase failed";
      return { success: false, error: errorMessage };
    }
  };

  // Create order for user
  const createOrderForUser = async (orderData) => {
    try {
      const response = await api.post("/admin/order", orderData);
      setSuccessMessage("Order created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Order creation failed";
      return { success: false, error: errorMessage };
    }
  };

  // Send email to user
  const sendEmail = async (subject, content, username) => {
    try {
      const response = await api.post("/admin/sendEmail", {
        subject,
        content,
        username,
      });
      setSuccessMessage("Email sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to send email";
      return { success: false, error: errorMessage };
    }
  };

  // Get user details
  const getUserDetails = async (username) => {
    if (userDetailsCache[username]) {
      return userDetailsCache[username];
    }

    try {
      const response = await api.post("/admin/user", { user: { username } });
      if (response.data.user) {
        setUserDetailsCache((prev) => ({
          ...prev,
          [username]: response.data.user,
        }));
        return response.data.user;
      }
      // console.log(response.data);
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userType");
    onLogout();
  };

  useEffect(() => {
    // Fetch approved orders on mount for SUBADMIN
    if (userType === "SUBADMIN") {
      fetchApprovedOrders();
    } else {
      fetchOrders();
    }
  }, [userType]);

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
                <p className="text-sm text-gray-500">
                  Order Management System {userType && `(${userType})`}
                </p>
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
            {hasAccess("orders") && (
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
            )}
            {hasAccess("passes") && (
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
            )}
            {hasAccess("approved") && (
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
            )}
            {hasAccess("quick-actions") && (
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
            )}
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

          {/* Event-wise count tabs for Approved Orders */}
          {activeTab === "approved" && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3">
                {/* ALL Tab */}
                <button
                  onClick={() => handleEventClick("all")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                    selectedEvent === "all"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm font-medium capitalize">ALL:</span>
                  <span className="text-sm font-bold">
                    {getEventCounts()["all"] || 0}
                  </span>
                </button>

                {/* Individual Event Tabs */}
                {eventOptions.map((event) => {
                  const count = getEventCounts()[event] || 0;
                  return (
                    <button
                      key={event}
                      onClick={() => handleEventClick(event)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedEvent === event
                          ? "bg-purple-600 text-white border-purple-600 shadow-md"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium capitalize ${
                          selectedEvent === event
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {event.replace(/_/g, " ")}:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          selectedEvent === event
                            ? "text-white"
                            : "text-purple-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
        ) : activeTab === "approved" ? (
          <ApprovedOrders
            orders={filteredApprovedOrders}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : activeTab === "orders" && hasAccess("orders") ? (
          <PendingOrders
            orders={filteredOrders}
            onApprove={approveOrder}
            onDecline={declineOrder}
            loadingOrderId={loadingOrderId}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : activeTab === "passes" && hasAccess("passes") ? (
          <PendingPass
            orders={filteredPassOrders}
            onApprove={approvePassOrder}
            onDecline={declinePassOrder}
            loadingPassOrderId={loadingPassOrderId}
            onSendEmail={(username) => setEmailModalData({ username })}
            getUserDetails={getUserDetails}
          />
        ) : activeTab === "quick-actions" && hasAccess("quick-actions") ? (
          <QuickActions
            onRegister={quickRegisterUser}
            onBuyPass={buyPassForUser}
            onCreateOrder={createOrderForUser}
          />
        ) : null}
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
