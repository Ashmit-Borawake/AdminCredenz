import React, { useState } from "react";
import { CheckSquare, Mail } from "lucide-react";

const ApprovedOrders = ({ orders, onSendEmail, getUserDetails }) => {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [loadingMembers, setLoadingMembers] = useState({});

  const toggleOrderExpansion = async (orderID, order) => {
    const isExpanding = !expandedOrders[orderID];
    setExpandedOrders((prev) => ({ ...prev, [orderID]: isExpanding }));

    if (isExpanding) {
      // Collect all unique usernames from all order items
      const allUsernames = new Set();
      order.orderItems.forEach((item) => {
        [item.username1, item.username2, item.username3, item.username4]
          .filter(Boolean)
          .forEach((username) => allUsernames.add(username));
      });

      // Fetch details for usernames we don't have yet
      const usernamesToFetch = Array.from(allUsernames).filter(
        (username) => !userDetails[username],
      );

      if (usernamesToFetch.length > 0) {
        setLoadingMembers((prev) => ({ ...prev, [orderID]: true }));

        // Fetch all user details in parallel
        const detailsPromises = usernamesToFetch.map((username) =>
          getUserDetails(username).then((details) => ({
            username,
            details,
          })),
        );

        const results = await Promise.all(detailsPromises);

        // Update state with all fetched details
        const newDetails = {};
        results.forEach(({ username, details }) => {
          if (details) {
            newDetails[username] = details;
          }
        });

        setUserDetails((prev) => ({ ...prev, ...newDetails }));
        setLoadingMembers((prev) => ({ ...prev, [orderID]: false }));
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

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    return date.toLocaleString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {orders.map(([orderID, order]) => {
        const username = order.orderItems[0].username1;
        const isExpanded = expandedOrders[orderID];
        const user = userDetails[username];
        const isLoadingMembers = loadingMembers[orderID];

        return (
          <div
            key={orderID}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleOrderExpansion(orderID, order)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      {isExpanded ? "▼ Hide Details" : "▶ Show User Details"}
                    </button>

                    <span className="font-medium text-gray-900 text-sm">
                      Approved At :{" "}
                      <span className="font-medium text-gray-900 text-sm">
                        {formatDateTime(order.orderItems[0]?.updatedAt)}
                      </span>
                    </span>
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
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Approved
                    </span>
                  </div>

                  {isExpanded && user && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
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
                  {isExpanded && (!user || isLoadingMembers) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">
                        Loading user details...
                      </p>
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
                      <p className="text-xs text-gray-500 uppercase mb-2">
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
                          .map((username, idx) => {
                            const memberDetails = userDetails[username];
                            return (
                              <span
                                key={idx}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-medium"
                                title={
                                  memberDetails
                                    ? `${memberDetails.firstName} ${memberDetails.lastName}`
                                    : username
                                }
                              >
                                {username}
                                {memberDetails && (
                                  <span className="ml-2 text-green-600">
                                    - {memberDetails.phoneNumber}
                                  </span>
                                )}
                              </span>
                            );
                          })}
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

export default ApprovedOrders;
