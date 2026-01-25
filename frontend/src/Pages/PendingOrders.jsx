import React, { useState } from "react";
import { CheckCircle, XCircle, Package, Mail } from "lucide-react";

const PendingOrders = ({
  orders,
  onApprove,
  onDecline,
  onSendEmail,
  getUserDetails,
  loadingOrderId,
}) => {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [userDetails, setUserDetails] = useState({});

  const toggleOrderExpansion = async (orderID, username) => {
    const isExpanding = !expandedOrders[orderID];
    setExpandedOrders((prev) => ({ ...prev, [orderID]: isExpanding }));

    if (isExpanding && !userDetails[username]) {
      const details = await getUserDetails(username);
      if (details) {
        setUserDetails((prev) => ({ ...prev, [username]: details }));
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
          <div
            key={orderID}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="bg-linear-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order ID: {orderID}
                    </h3>
                    <button
                      onClick={() => toggleOrderExpansion(orderID, username)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {isExpanded ? "▼ Hide Details" : "▶ Show User Details"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Original:{" "}
                      <span className="font-semibold text-gray-900">
                        ₹{order.originalOrderValue}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      Final:{" "}
                      <span className="font-semibold text-green-600">
                        ₹{order.finalOrderValue}
                      </span>
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.isApproved
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.isApproved ? "Verified" : "Pending"}
                    </span>
                  </div>

                  {isExpanded && user && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        User Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">
                            {user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">
                            {user.phoneNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">College</p>
                          <p className="font-medium text-gray-900">
                            {user.collegeName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {isExpanded && !user && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">
                        Loading user details...
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  {/* Approve */}
                  <button
                    onClick={() => onApprove(orderID)}
                    disabled={loadingOrderId === orderID}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition
      ${
        loadingOrderId === orderID
          ? "bg-green-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      } text-white`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {loadingOrderId === orderID ? "Approving..." : "Approve"}
                    </span>
                  </button>

                  {/* Decline */}
                  <button
                    onClick={() => onDecline(orderID)}
                    disabled={loadingOrderId === orderID}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition
                    ${
                      loadingOrderId === orderID
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>
                      {loadingOrderId === orderID ? "Declining..." : "Decline"}
                    </span>
                  </button>

                  {/* Email */}
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
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Event</p>
                        <p className="font-medium text-gray-900">
                          {item.eventSlug}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">
                          Team Name
                        </p>
                        <p className="font-medium text-gray-900">
                          {item.teamname}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Price</p>
                        <p className="font-medium text-gray-900">
                          <span className="line-through text-gray-400">
                            ₹{item.originalPrice}
                          </span>{" "}
                          <span className="text-green-600">
                            ₹{item.finalPrice}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">
                          Transaction ID
                        </p>
                        <p className="font-medium text-gray-900 text-sm">
                          {item.transactionID}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase mb-1">
                        Team Members
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          item.username1,
                          item.username2,
                          item.username3,
                          item.username4,
                        ]
                          .filter(Boolean)
                          .map((username, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                            >
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

export default PendingOrders;
