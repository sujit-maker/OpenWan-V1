import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Site } from './types'; 
import { useAuth } from '../hooks/useAuth';

interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceCreated: () => void;
}

interface User {
  id: string;
  username: string;
}


const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({
  isOpen,
  onClose,
  onDeviceCreated,
}) => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [devicePort, setDevicePort] = useState('');
  const [portCount, setPortCount] = useState ('');
  const [deviceUsername, setDeviceUsername] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | null>(null);

  const { currentUserType, adminId } = useAuth();
  const [managers, setManagers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>(""); // Starts empty
  const [managerId, setManagerId] = useState(""); // Store manager ID


  useEffect(() => {
    if (isOpen) {
      fetchSites(managerId); 
    }
  }, [isOpen]);

   // Fetch sites when the modal is open
   useEffect(() => {
    if (isOpen) {
      fetchSites(managerId); // Fetch sites when modal is open
    }
  }, [isOpen]);

  // Fetch managers based on selected adminId (for SUPERADMIN)
  useEffect(() => {
    if (currentUserType === "SUPERADMIN" && selectedAdminId) {
      fetchManagers(selectedAdminId); // Fetch managers for selected adminId
    }
  }, [currentUserType, selectedAdminId]);

  useEffect(() => {
    if (currentUserType === "SUPERADMIN" && selectedAdminId) {
      fetchManagers(selectedAdminId); // Pass selectedAdminId for SUPERADMIN
    } else if (currentUserType === "ADMIN" && adminId) {
      fetchManagers(adminId); // Pass adminId for ADMIN
    }
  }, [currentUserType, selectedAdminId, adminId]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/users/admins");
      const data: User[] = await response.json();
      console.log("Fetched admins:", data); // Debug logging to inspect the fetched data
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to fetch admins");
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
      fetchSites(managerId); // Fetch sites based on selected manager
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

  // Effect to fetch sites whenever the managerId is set
  useEffect(() => {
    if (managerId) {
      fetchSites(managerId); // Fetch sites when managerId is set
    } else {
      setSites([]); // Clear sites if managerId is not set
    }
  }, [managerId]); // Runs when managerId is updated


  const fetchSites = async (managerId: string) => {
    try {
      // Use the managerId in the query string to fetch sites
      const response = await fetch(`http://localhost:8000/site?managerId=${managerId}`);
      if (response.ok) {
        const data: Site[] = await response.json();
        setSites(data); // Update the state with the fetched sites
      } else {
        console.error('Error fetching sites:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchManagers = async (adminId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/users/managers/admin?adminId=${adminId}`
      );
      const data: User[] = await response.json();
      setManagers(Array.isArray(data) ? data : []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching managers:", error);
      setError("Failed to fetch managers");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      deviceName,
      siteId,
      deviceType,
      deviceIp,
      devicePort,
      portCount,
      deviceUsername,
      devicePassword,
      adminId:
        currentUserType === "SUPERADMIN"
          ? Number(selectedAdminId)
          : Number(adminId),
      managerId: managerId ? Number(managerId) : null,
    };

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        // Create the success message with the device URL
        const deviceUrl = `/devices/${data.deviceId}`;
        alert("Site created successfully!");
        setError(null);
        onDeviceCreated();
        resetForm();
       
        setTimeout(onClose, 2000); 
      } else {
        setError(data.message || 'An error occurred while creating the device.');
        setSuccess(null);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDeviceName('');
    setDeviceType('');
    setDeviceIp('');
    setDevicePort('');
    setPortCount ('');
    setDeviceUsername('');
    setDevicePassword('');
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
    <Dialog
      as="div"
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]"
      aria-labelledby="create-device-title"
    >
      <Dialog.Panel className="max-w-sm w-full max-h-[90vh] bg-white rounded-lg shadow-lg p-6 overflow-y-auto">
        <Dialog.Title id="create-device-title" className="text-xl font-semibold mb-4">
          Add New Device
        </Dialog.Title>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4" role="alert">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deviceName" className="block text-gray-700">Device Name</label>
            <input
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          {currentUserType === "SUPERADMIN" && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Select Admin
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => {
                const newAdminId = e.target.value;
                setSelectedAdminId(e.target.value);
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
            <label className="block text-sm font-medium mb-1">
              Select Manager
            </label>
            <select
              value={managerId}
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
            <label className="block text-sm font-medium mb-1">
              Select Site
            </label>
            <select
              value={siteId || ""}
              onChange={(e) => setSiteId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.siteName}
                </option>
              ))}
            </select>
          </div>
        )}

         
          <div className="mb-4">
            <label htmlFor="deviceType" className="block text-gray-700">Device Type</label>
            <input
              id="deviceType"
              type="text"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="deviceIp" className="block text-gray-700">Device IP</label>
            <input
              id="deviceIp"
              type="text"
              value={deviceIp}
              onChange={(e) => setDeviceIp(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="devicePort" className="block text-gray-700">Device Port</label>
            <input
              id="devicePort"
              type="text"
              value={devicePort}
              onChange={(e) => setDevicePort(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="portCount" className="block text-gray-700">Number Of Wan</label>
            <input
              id="portCount"
              type="text"
              value={portCount}
              onChange={(e) => setPortCount(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="deviceUsername" className="block text-gray-700">Device Username</label>
            <input
              id="deviceUsername"
              type="text"
              value={deviceUsername}
              onChange={(e) => setDeviceUsername(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="devicePassword" className="block text-gray-700">Device Password</label>
            <input
              id="devicePassword"
              type="password"
              value={devicePassword}
              onChange={(e) => setDevicePassword(e.target.value)}
              required
              className="w-full border rounded p-2 mt-1"
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-300 text-black rounded px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue-500 text-white rounded px-4 py-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Add Device'}
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  </Transition>
    );
};

export default CreateDeviceModal;
