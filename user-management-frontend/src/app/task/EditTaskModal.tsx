import React, { useState, useEffect } from "react";
import { Task, Service, Site, Customer, EditTaskModalProps } from "./types"; // Adjust path as needed

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  closeModal,
  onTaskUpdated,
  customers = [],
  sites = [],
  services = [],
}) => {
  // Initialize form state with the task data
  const [updatedTask, setUpdatedTask] = useState<Task>(task);

  // Sync task prop when it changes
  useEffect(() => {
    setUpdatedTask(task);
  }, [task]);

  // Handle form input changes dynamically
  const handleInputChange = (field: keyof Task, value: string) => {
    setUpdatedTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Save action
  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8000/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const updatedTaskData = await response.json();
      onTaskUpdated(updatedTaskData); // Notify parent component
      closeModal(); // Close modal after successful update
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Task</h2>

        {/* Customer Name */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <select
            value={updatedTask.customerName || ''}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a customer</option>
            {customers.map((customer: Customer) => (
              <option key={customer.id} value={customer.customerName}>
                {customer.customerName}
              </option>
            ))}
          </select>
        </div> */}

        {/* Site Name */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Site Name</label>
          <select
            value={updatedTask.siteName || ''}
            onChange={(e) => handleInputChange('siteName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a site</option>
            {sites.map((site: Site) => (
              <option key={site.id} value={site.siteName}>
                {site.siteName}
              </option>
            ))}
          </select>
        </div> */}

        {/* Service Name */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Service Name</label>
          <select
            value={updatedTask.serviceName || ''}
            onChange={(e) => handleInputChange('serviceName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a service</option>
            {services.map((service: Service) => (
              <option key={service.id} value={service.serviceName}>
                {service.serviceName}
              </option>
            ))}
          </select>
        </div> */}

        {/* Service Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Service Type</label>
          <select
            value={updatedTask.serviceType || ''}
            onChange={(e) => handleInputChange('serviceType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a service type</option>
            <option value="AMC">AMC</option>
            <option value="NewInstallation">New Installation</option>
            <option value="OnDemandSupport">On-Demand Support</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={updatedTask.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={updatedTask.date ? new Date(updatedTask.date).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Remark */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Remark</label>
          <input
            type="text"
            value={updatedTask.remark || ''}
            onChange={(e) => handleInputChange('remark', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end">
          <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
