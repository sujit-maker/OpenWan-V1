import React, { useState } from 'react';
import { Service } from './types'; // Adjust path as needed

interface EditServiceModalProps {
  service: Service;
  onServiceUpdated: (service: Service) => void;
  closeModal: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  onServiceUpdated,
  closeModal,
}) => {
  const [updatedService, setUpdatedService] = useState<Service>(service);

  const handleInputChange = (field: string, value: string) => {
    setUpdatedService((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://122.169.108.252:8000/services/${updatedService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: updatedService.serviceName,
          description: updatedService.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.message || 'Failed to update service'}`);
      }

      const updatedServiceData = await response.json();
      onServiceUpdated(updatedServiceData); // Notify parent component of updated service
      closeModal(); // Close the modal after successful update
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Service</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Service ID</label>
          <input
            type="text"
            value={updatedService.serviceId}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Service Name</label>
          <input
            type="text"
            value={updatedService.serviceName}
            onChange={(e) => handleInputChange('serviceName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={updatedService.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditServiceModal;
