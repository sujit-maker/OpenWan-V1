import React, { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
}

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState(""); // Store admin ID
  const [managerId, setManagerId] = useState(""); // Store manager ID

  const [admins, setAdmins] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const userType = localStorage.getItem("userType");
  const loggedInAdminId = localStorage.getItem("adminId");

  // Automatically set adminId for ADMIN users and fetch managers
  useEffect(() => {
    if (userType === "ADMIN" && loggedInAdminId) {
      setAdminId(loggedInAdminId); // Pre-fill adminId for ADMIN userType
    }
  }, [userType, loggedInAdminId]);

  useEffect(() => {
    // Fetch all admins (if needed for non-ADMIN users)
    const fetchAdmins = async () => {
      try {
        const adminResponse = await fetch("http://40.0.0.109:8000/users/admins");
        const adminData: User[] = await adminResponse.json();
        setAdmins(adminData);
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      }
    };

    // Only fetch admins if the user is not ADMIN
    if (userType !== "ADMIN") {
      fetchAdmins();
    }
  }, [userType]);

  // Fetch managers associated with a specific adminId
  useEffect(() => {
    const fetchFilteredManagers = async () => {
      if (!adminId) {
        setManagers([]); // Clear managers if no adminId is set
        return;
      }
      try {
        const response = await fetch(
          `http://40.0.0.109:8000/users/managers/admin?adminId=${adminId}`
        );
        const filteredData: User[] = await response.json();
        setManagers(filteredData); // Update managers based on adminId
      } catch (error) {
        console.error("Failed to fetch filtered managers:", error);
      }
    };

    fetchFilteredManagers();
  }, [adminId]); // Trigger fetching filtered managers whenever adminId changes

  const handleSubmit = async () => {
    // Validation
    if (!customerName || !customerAddress || !gstNumber || !contactName || !contactNumber || !email) {
      alert("All fields are required!");
      return;
    }

    const customerData: any = {
      customerName,
      customerAddress,
      gstNumber,
      contactName,
      contactNumber,
      email,
      adminId: Number(adminId), // Convert adminId to an integer
    };

    // Only include managerId if the user is NOT a MANAGER
    if (userType !== "MANAGER" && managerId && managerId !== "") {
      customerData.managerId = Number(managerId); // Convert managerId to an integer
    }

    // Log the data being sent for debugging
    console.log("Customer Data to be sent:", customerData);

    try {
      const response = await fetch("http://40.0.0.109:8000/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error posting data:", errorText);
        alert("Failed to create customer: " + errorText);
      } else {
        alert("Customer created successfully!");
        onCustomerCreated();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("An error occurred while posting the data.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md sm:w-96 overflow-y-auto max-h-[80vh]">
        <h2 className="text-lg font-semibold mb-4 text-center">Add New Customer</h2>

        {/* Customer details */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer Address</label>
          <textarea
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">GST Number</label>
          <input
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Name</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Admin Dropdown */}
        {userType !== "ADMIN" && userType !== "MANAGER" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Admin</label>
            <select
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">--Select Admin--</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.username}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Manager Dropdown (Visible for ADMIN and other userTypes when adminId is set) */}
        {adminId && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Manager</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">--Select Manager--</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.username}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerModal;
