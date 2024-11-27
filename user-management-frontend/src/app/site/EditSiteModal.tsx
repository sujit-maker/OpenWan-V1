// EditSiteModal.tsx
import React, { useState, useEffect } from 'react';
import { Customer, Site } from './types'; // Adjust path as needed

interface EditSiteModalProps {
  isOpen: boolean;
  site: Site | null;
  customers: Customer[];
  onSiteUpdated: (updatedSite: Site) => void;
  closeModal: () => void;
  fetchSites: () => void;
}

const EditSiteModal: React.FC<EditSiteModalProps> = ({ isOpen, site, customers, onSiteUpdated, closeModal, fetchSites }) => {
  const [updatedSite, setUpdatedSite] = useState<Site | null>(null);

  useEffect(() => {
    if (site) {
      setUpdatedSite({ ...site });
    }
  }, [site]);

  const handleInputChange = (field: keyof Site, value: any) => {
    if (updatedSite) {
      setUpdatedSite({
        ...updatedSite,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    if (updatedSite) {
      try {
        const response = await fetch(`http://localhost:8000/site/${updatedSite.id}`, {
          method: 'PATCH', // Use PATCH for updating resources
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedSite),
        });
        if (!response.ok) {
          throw new Error('Failed to update site');
        }
        const data: Site = await response.json();
        onSiteUpdated(data); // Notify parent component of the update
        fetchSites(); // Refresh data
        closeModal(); // Close the modal
      } catch (error) {
        console.error('Error updating site:', error);
      }
    }
  };

  if (!isOpen || !updatedSite) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Site</h2>
          <button
            onClick={closeModal}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Site Name</label>
          <input
            type="text"
            value={updatedSite.siteName}
            onChange={(e) => handleInputChange('siteName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <select
            value={updatedSite.customerId}
            onChange={(e) => handleInputChange('customerId', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.customerName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Site Address</label>
          <textarea
            value={updatedSite.siteAddress}
            onChange={(e) => handleInputChange('siteAddress', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Name</label>
          <input
            type="text"
            value={updatedSite.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input
            type="text"
            value={updatedSite.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contact Email</label>
          <input
            type="email"
            value={updatedSite.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded shadow mr-2 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSiteModal;
