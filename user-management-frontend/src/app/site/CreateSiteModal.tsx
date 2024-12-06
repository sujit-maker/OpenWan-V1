import React, { useState, useEffect } from "react";
import { Customer, Site } from "./types"; // Adjust path as needed
import { useAuth } from "../hooks/useAuth"; // Adjust path as needed
import { Spinner } from "react-bootstrap";
import { Transition, Dialog } from "@headlessui/react";

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated: (site: Site) => void;
  fetchSites: () => void;
}

interface User {
  id: string;
  username: string;
}

const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
  isOpen,
  onClose,
  onSiteCreated,
  fetchSites,
}) => {
  const { currentUserType } = useAuth();
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>(""); // Starts empty
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState(""); // Store admin ID
  const [managerId, setManagerId] = useState(""); // Store manager ID

  const loggedInAdminId = localStorage.getItem("adminId");
  const loggedInManagerId = localStorage.getItem("managerId"); // Fetch managerId from localStorage if user is a manager
  const userType = localStorage.getItem("userType");

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

  // Fetch customers when the modal is open
  useEffect(() => {
    if (isOpen) {
      fetchCustomers(managerId); // Fetch customers when modal is open
    }
  }, [isOpen]);

 

  useEffect(() => {
    if (currentUserType === "SUPERADMIN" && selectedAdminId) {
      fetchManagers(selectedAdminId);
    } else if (currentUserType === "ADMIN" && adminId) {
      fetchManagers(adminId);
    }
  }, [currentUserType, selectedAdminId, adminId]);

  useEffect(() => {
    if (userType === "MANAGER" && loggedInManagerId) {
      const fetchAdminIdForManager = async () => {
        try {
          // Fetch adminId associated with the logged-in manager
          const response = await fetch(
            `http://localhost:8000/users/admins/manager?managerId=${loggedInManagerId}`
          );
          const data = await response.json();
          setAdminId(data[0]?.id || ""); // Set adminId from the API response
        } catch (error) {
          console.error("Failed to fetch adminId for manager:", error);
        }
      };

      fetchAdminIdForManager();
    }
  }, [loggedInManagerId, userType]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);
    setAdmins([]); // Clear previous data to avoid confusion during loading
  
    try {
      const response = await fetch("http://localhost:8000/users/admins");
      const data: User[] = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to fetch admins.");
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    if (currentUserType === "SUPERADMIN") {
      fetchAdmins(); // Fetch admins for SUPERADMIN user type
    } else if (currentUserType === "ADMIN" && adminId != null) {
      fetchManagers(selectedAdminId); // Directly fetch managers for ADMIN
    }
  }, [currentUserType, adminId]);

  useEffect(() => {
    if (managerId) {
      fetchCustomers(managerId); // Fetch customers based on selected manager
    }
  }, [managerId]);

  // Effect to retrieve managerId when the user is a MANAGER
  useEffect(() => {
    if (currentUserType === "MANAGER") {
      // Retrieve managerId from localStorage
      const loggedInManagerId = localStorage.getItem("managerId");

      // If the managerId exists, set it in the state
      if (loggedInManagerId) {
        setManagerId(loggedInManagerId); // Update state with the managerId
      }
    }
  }, [currentUserType]); // Runs when the currentUserType changes

  // Effect to fetch customers whenever the managerId is set
  useEffect(() => {
    if (managerId) {
      fetchCustomers(managerId); // Fetch customers when managerId is set
    } else {
      setCustomers([]); // Clear customers if managerId is not set
    }
  }, [managerId]); // Runs when managerId is updated

  // Function to fetch customers based on managerId
  const fetchCustomers = async (managerId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Construct the URL with the managerId query parameter
      const url = `http://localhost:8000/customers?managerId=${managerId}`;

      // Fetch customers from the API
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data: Customer[] = await response.json();
      setCustomers(data); // Set the customers in state
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger customer fetch when managerId changes
  useEffect(() => {
    if (managerId) {
      fetchCustomers(managerId); // Fetch customers when managerId is set
    } else {
      setCustomers([]); // Clear customers when managerId is empty
    }
  }, [managerId]);

  const fetchManagers = async (adminId: string) => {
    if (!adminId || isNaN(Number(adminId))) {
      console.error("Invalid adminId:", adminId); 
      setError("Invalid adminId provided.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/users/managers/admin?adminId=${adminId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch managers. Status: ${response.status}`);
      }

      const data: User[] = await response.json();
      setManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setError("Failed to fetch managers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !siteName ||
      !siteAddress ||
      !contactName ||
      !contactNumber ||
      !contactEmail ||
      !customerId
    ) {
      alert("All fields are required!");
      return;
    }

    const siteData: any = {
      siteName,
      siteAddress,
      contactName,
      contactNumber,
      contactEmail,
      customerId: Number(customerId),
      adminId:
        currentUserType === "SUPERADMIN"
          ? Number(selectedAdminId)
          : Number(adminId),
      managerId:
        userType === "MANAGER" && loggedInManagerId
          ? Number(loggedInManagerId)
          : Number(managerId),
    };

    // If the user is a MANAGER, automatically include the managerId (do not require the manager to select)
    if (userType === "MANAGER" && loggedInManagerId) {
      siteData.managerId = Number(loggedInManagerId); // Use the logged-in manager's ID directly
      siteData.adminId = Number(adminId); // Include the adminId associated with the manager
    } else if (userType !== "MANAGER" && managerId && managerId !== "") {
      // For Admins and other user types, use the selected managerId from the dropdown
      siteData.managerId = Number(managerId); // Ensure managerId is a number
    }

    if (currentUserType !== "MANAGER" && managerId && managerId !== "") {
      siteData.managerId = Number(managerId);
    }

    try {
      const response = await fetch("http://localhost:8000/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError("Failed to create site: " + errorText);
      } else {
        const newSite: Site = await response.json();
        alert("Site created successfully!");
        onSiteCreated(newSite);
        fetchSites();
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create site:", error);
      alert("An error occurred while posting the data.");
    }
  };

  const resetForm = () => {
    setSiteName("");
    setSiteAddress("");
    setContactName("");
    setContactNumber("");
    setContactEmail("");
    setCustomerId(null);
    setManagerId("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm(); // Reset the form when modal is closed
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (

    <Transition show={isOpen} as={React.Fragment}>
    <Dialog
      as="div"
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999] backdrop-blur-md"
      aria-labelledby="create-user-title"
      aria-describedby="create-user-description"
    >
      <Dialog.Panel className="max-w-sm w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-lg shadow-2xl p-6 transform transition-transform duration-300 hover:scale-105">
        <Dialog.Title className="text-2xl font-semibold text-white mb-6 text-center">
          Create Site
        </Dialog.Title>

    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 shadow-md">{error}</div>}

    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-1">Site Name</label>
      <input
        type="text"
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    {currentUserType === "SUPERADMIN" && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">Select Admin</label>
        <select
          value={selectedAdminId}
          onChange={(e) => {
            const newAdminId = e.target.value;
            setSelectedAdminId(newAdminId);
            setManagerId(""); // Reset managerId when admin is changed
            fetchManagers(newAdminId); // Fetch managers for the selected admin
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Admin</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.username}
            </option>
          ))}
        </select>
      </div>
    )}

    {(currentUserType === "ADMIN" || currentUserType === "SUPERADMIN") && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">Select Manager</label>
        <select
          value={managerId || ""}
          onChange={(e) => setManagerId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.username}
            </option>
          ))}
        </select>
      </div>
    )}

    {(currentUserType === "MANAGER" || managerId) && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">Select Customer</label>
        <select
          value={customerId || ""}
          onChange={(e) => setCustomerId(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Customer</option>
          {customers.map((site) => (
            <option key={site.id} value={site.id}>
              {site.customerName}
            </option>
          ))}
        </select>
      </div>
    )}

    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-1">Site Address</label>
      <textarea
        value={siteAddress}
        onChange={(e) => setSiteAddress(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-1">Contact Name</label>
      <input
        type="text"
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-1">Contact Number</label>
      <input
        type="text"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-1">Contact Email</label>
      <input
        type="email"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
    </div>

    <div className="flex justify-end space-x-4 mt-6">
      <button
        onClick={onClose}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg transition-all hover:bg-gray-700"
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 hover:bg-blue-600 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? <Spinner /> : "Create"}
      </button>
    </div>
    </Dialog.Panel>
    </Dialog>
  </Transition>


  );
};

export default CreateSiteModal;
