import React, { useState, useEffect } from 'react';
import { Customer, Site } from './types'; // Adjust path as needed
import { useAuth } from '../hooks/useAuth'; // Adjust path as needed

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

const CreateSiteModal: React.FC<CreateSiteModalProps> = ({ isOpen, onClose, onSiteCreated, fetchSites }) => {
  const { currentUserType, adminId } = useAuth();
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [managerId, setManagerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers(); // Fetch customers when modal is open
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentUserType === 'ADMIN' && adminId) {
      fetchManagers(); // Fetch managers if the user is an admin
    }
  }, [currentUserType, adminId]);

  useEffect(() => {
    if (managerId) {
      // Fetch customers for the selected manager
      fetchCustomers(managerId);
    } else {
      setCustomers([]); // Clear customers if no manager is selected
    }
  }, [managerId]);

  const fetchCustomers = async (managerId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let url = 'http://40.0.0.109:8000/customers';

      // If a managerId is selected, fetch customers associated with that manager
      if (managerId) {
        url = `http://40.0.0.109:8000/customers?managerId=${managerId}`;
      } else if (currentUserType === 'ADMIN' && adminId) {
        url = `http://40.0.0.109:8000/customers?adminId=${adminId}`;
      }

      const response = await fetch(url);
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://40.0.0.109:8000/users/managers/admin?adminId=${adminId}`);
      const data: User[] = await response.json();
      setManagers(data);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setError('Failed to fetch managers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!siteName || !siteAddress || !contactName || !contactNumber || !contactEmail || !customerId) {
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
      adminId: Number(adminId),
    };
  
    if (currentUserType !== "MANAGER" && managerId && managerId !== "") {
      siteData.managerId = Number(managerId);
    }
  
    try {
      const response = await fetch("http://40.0.0.109:8000/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        alert("Failed to create site: " + errorText);
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
    setSiteName('');
    setSiteAddress('');
    setContactName('');
    setContactNumber('');
    setContactEmail('');
    setCustomerId(null);
    setManagerId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
        <h2 className="text-2xl font-semibold mb-6">Create Site</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Site Name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {currentUserType === 'ADMIN' && adminId && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Manager</label>
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

        {/* Show customer dropdown only if a manager is selected */}
        {managerId && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Customer</label>
            <select
              value={customerId || ''}
              onChange={(e) => setCustomerId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customerName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Site Address</label>
          <textarea
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Name</label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Site'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSiteModal;
