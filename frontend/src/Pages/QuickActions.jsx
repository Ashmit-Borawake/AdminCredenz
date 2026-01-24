import React, { useState } from "react";

const QuickActions = ({ onRegister, onBuyPass, onCreateOrder }) => {
  const [activeForm, setActiveForm] = useState("register");
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

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
  ];

  const handleRegisterSubmit = async () => {
    setFormError("");
    setFormLoading(true);

    const {
      username,
      password,
      email,
      phoneNumber,
      firstName,
      lastName,
      collegeName,
      isJunior,
    } = formData;

    if (
      !username ||
      !password ||
      !email ||
      !phoneNumber ||
      !firstName ||
      !lastName ||
      !collegeName
    ) {
      setFormError("Please fill all required fields");
      setFormLoading(false);
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setFormError("Username must be between 3 and 20 characters");
      setFormLoading(false);
      return;
    }

    if (password.length < 8 || password.length > 20) {
      setFormError("Password must be between 8 and 20 characters");
      setFormLoading(false);
      return;
    }

    if (phoneNumber.length !== 10) {
      setFormError("Phone number must be 10 digits");
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
      isJunior: isJunior === "true",
    });

    setFormLoading(false);

    if (result.success) {
      setFormData({});
    } else {
      setFormError(result.error);
    }
  };

  const handleBuyPassSubmit = async () => {
    setFormError("");
    setFormLoading(true);

    const { username, transactionID } = formData;

    if (!username || !transactionID) {
      setFormError("Please fill all required fields");
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
    setFormError("");
    setFormLoading(true);

    const {
      username1,
      username2,
      username3,
      username4,
      eventSlug,
      teamname,
      transactionID,
    } = formData;

    if (!username1 || !eventSlug || !teamname || !transactionID) {
      setFormError(
        "Please fill all required fields (username1, eventSlug, teamname, transactionID)",
      );
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
      transactionID,
    });

    setFormLoading(false);

    if (result.success) {
      setFormData({});
    } else {
      setFormError(result.error);
    }
  };

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Form Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setActiveForm("register");
              setFormData({});
              setFormError("");
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              activeForm === "register"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Register User
          </button>
          <button
            onClick={() => {
              setActiveForm("buyPass");
              setFormData({});
              setFormError("");
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              activeForm === "buyPass"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Buy Pass
          </button>
          <button
            onClick={() => {
              setActiveForm("createOrder");
              setFormData({});
              setFormError("");
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              activeForm === "createOrder"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Create Order
          </button>
        </div>
      </div>

      {/* Register User Form */}
      {activeForm === "register" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Quick Register User
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="3-20 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password || ""}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="8-20 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="10 digits"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName || ""}
                onChange={(e) => updateFormData("firstName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName || ""}
                onChange={(e) => updateFormData("lastName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Name *
              </label>
              <input
                type="text"
                value={formData.collegeName || ""}
                onChange={(e) => updateFormData("collegeName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is Junior? *
              </label>
              <select
                value={formData.isJunior || "false"}
                onChange={(e) => updateFormData("isJunior", e.target.value)}
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
            {formLoading ? "Registering..." : "Register User"}
          </button>
        </div>
      )}

      {/* Buy Pass Form */}
      {activeForm === "buyPass" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Buy Pass for User
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                value={formData.transactionID || ""}
                onChange={(e) =>
                  updateFormData("transactionID", e.target.value)
                }
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
            {formLoading ? "Processing..." : "Buy Pass"}
          </button>
        </div>
      )}

      {/* Create Order Form */}
      {activeForm === "createOrder" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Create Event Order
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username 1 (Leader) *
                </label>
                <input
                  type="text"
                  value={formData.username1 || ""}
                  onChange={(e) => updateFormData("username1", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Team leader username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username 2
                </label>
                <input
                  type="text"
                  value={formData.username2 || ""}
                  onChange={(e) => updateFormData("username2", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username 3
                </label>
                <input
                  type="text"
                  value={formData.username3 || ""}
                  onChange={(e) => updateFormData("username3", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username 4
                </label>
                <input
                  type="text"
                  value={formData.username4 || ""}
                  onChange={(e) => updateFormData("username4", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event *
              </label>
              <select
                value={formData.eventSlug || ""}
                onChange={(e) => updateFormData("eventSlug", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="">Select an event</option>
                {eventOptions.map((event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                value={formData.teamname || ""}
                onChange={(e) => updateFormData("teamname", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                value={formData.transactionID || ""}
                onChange={(e) =>
                  updateFormData("transactionID", e.target.value)
                }
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
            {formLoading ? "Creating Order..." : "Create Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
