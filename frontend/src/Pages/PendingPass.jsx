import React, { useState } from "react";
import { CheckCircle, XCircle, CreditCard, Mail } from "lucide-react";

const PendingPass = ({
  orders,
  onApprove,
  onDecline,
  onSendEmail,
  getUserDetails,
  loadingPassOrderId,
}) => {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [userDetails, setUserDetails] = useState({});

  const toggleOrderExpansion = async (orderId, username) => {
    const isExpanding = !expandedOrders[orderId];
    setExpandedOrders((prev) => ({ ...prev, [orderId]: isExpanding }));

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
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            <div className="bg-linear-to-r from-purple-600 to-blue-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Credenz Pass</h3>
                <button
                  onClick={() =>
                    toggleOrderExpansion(order.id, order.username1)
                  }
                  className="text-white text-sm hover:text-purple-100"
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Order ID</p>
                <p className="font-medium text-gray-900 text-sm">
                  {order.orderID}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Username</p>
                <p className="font-medium text-gray-900">{order.username1}</p>
              </div>

              {isExpanded && user && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2">
                    User Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Name</p>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-medium text-gray-900 text-xs break-all">
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="font-medium text-gray-900">
                        {user.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">College</p>
                      <p className="font-medium text-gray-900">
                        {user.collegeName}
                      </p>
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
                  <p className="font-medium text-gray-900">
                    ₹{order.actualPrice}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Paid</p>
                  <p className="font-medium text-green-600">
                    ₹{order.pricePaid}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Transaction ID
                </p>
                <p className="font-mono text-xs text-gray-900 break-all">
                  {order.transactionID}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200 flex space-x-2">
                {/* Approve */}
                <button
                  onClick={() => onApprove(order.orderID)}
                  disabled={loadingPassOrderId === order.orderID}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition text-sm font-medium
      ${
        loadingPassOrderId === order.orderID
          ? "bg-green-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      } text-white`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {loadingPassOrderId === order.orderID
                      ? "Approving..."
                      : "Approve"}
                  </span>
                </button>

                {/* Decline */}
                <button
                  onClick={() => onDecline(order.id)}
                  disabled={loadingPassOrderId === order.id}
                  className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition text-sm font-medium
                  ${
                    loadingPassOrderId === order.id
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>
                    {loadingPassOrderId === order.id
                      ? "Declining..."
                      : "Decline"}
                  </span>
                </button>

                {/* Email */}
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

export default PendingPass;
