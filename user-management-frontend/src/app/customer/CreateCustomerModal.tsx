import React, { useState, useEffect } from "react";

// Define the User type for the manager data
interface User {
  id: string; // Assuming the manager's ID is a string
  username: string; // Assuming the manager's username is a string
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
  const loggedInManagerId = localStorage.getItem("managerId"); // Fetch managerId from localStorage if user is a manager

  // Automatically set adminId for ADMIN users and fetch managers
  useEffect(() => {
    if (userType === "ADMIN" && loggedInAdminId) {
      setAdminId(loggedInAdminId); // Pre-fill adminId for ADMIN userType
    }
  }, [userType, loggedInAdminId]);

  // If the user is a MANAGER, pre-fill managerId from localStorage
  useEffect(() => {
    if (userType === "MANAGER" && loggedInManagerId) {
      setManagerId(loggedInManagerId); // Pre-fill managerId for MANAGER userType
    }
  }, [userType, loggedInManagerId]);

  useEffect(() => {
    // Fetch all admins (if needed for non-ADMIN users)
    const fetchAdmins = async () => {
      try {
        const adminResponse = await fetch(
          "http://localhost:8000/users/admins"
        );
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

  useEffect(() => {
    if (userType === "MANAGER" && loggedInManagerId) {
      const fetchAdminIdForManager = async () => {
        try {
          const response = await fetch(`http://localhost:8000/users/admins/manager?managerId=${loggedInManagerId}`);
          const data = await response.json();
          setAdminId(data[0]?.id || ""); // Assuming the API returns an array with the admin data
        } catch (error) {
          console.error("Failed to fetch adminId for manager:", error);
        }
      };

      fetchAdminIdForManager();
    }
  }, [loggedInManagerId, userType]);


  // Fetch managers associated with a specific adminId
  useEffect(() => {
    const fetchFilteredManagers = async () => {
      if (!adminId) {
        setManagers([]); // Clear managers if no adminId is set
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8000/users/managers/admin?adminId=${adminId}`
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
    // Validation for required fields
    if (
      !customerName ||
      !customerAddress ||
      !gstNumber ||
      !contactName ||
      !contactNumber ||
      !email
    ) {
      alert("All fields are required!");
      return;
    }

    // Prepare the customer data
    const customerData: any = {
      customerName,
      customerAddress,
      gstNumber,
      contactName,
      contactNumber,
      email,
      adminId: Number(adminId), // Ensure adminId is a number
      managerId: Number(managerId),
    };

    // If the user is a MANAGER, automatically include the managerId (do not require the manager to select)
    if (userType === "MANAGER" && loggedInManagerId) {
      customerData.managerId = Number(loggedInManagerId); // Use the logged-in manager's ID directly
      customerData.adminId = Number(adminId); // Include the adminId associated with the manager
    } else if (userType !== "MANAGER" && managerId && managerId !== "") {
      // For Admins and other user types, use the selected managerId from the dropdown
      customerData.managerId = Number(managerId); // Ensure managerId is a number
    }

    // Log the customerData object for debugging purposes
    console.log("Customer Data to be sent:", customerData);

    try {
      // POST request to the backend to create the customer
      const response = await fetch("http://localhost:8000/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData), // Send the customerData as JSON
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error posting data:", errorText);
        alert("Failed to create customer: " + errorText);
      } else {
        alert("Customer created successfully!");
        onCustomerCreated(); // Callback when customer is created
        onClose(); // Close the modal
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
        <h2 className="text-lg font-semibold mb-4 text-center">
          Add New Customer
        </h2>

        {/* Customer details */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

          {/* Admin Dropdown */}
          {userType !== "ADMIN" && userType !== "MANAGER" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select Admin
            </label>
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
        {adminId && userType !== "MANAGER" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select Manager
            </label>
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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Customer Address
          </label>
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
          <label className="block text-sm font-medium mb-1">
            Contact Number
          </label>
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
