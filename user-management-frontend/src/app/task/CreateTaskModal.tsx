import React, { useState, useEffect } from "react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [serviceTypes] = useState([
    { serviceTypeName: "AMC" },
    { serviceTypeName: "NewInstallation" },
    { serviceTypeName: "OnDemandSupport" },
  ]); // Define static list of service types

  const [customerName, setCustomerName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [remark, setRemark] = useState("");

  // Reset modal state when opening or closing
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchDropdownData();
    }
  }, [isOpen]);

  const resetForm = () => {
    setCustomerName("");
    setSiteName("");
    setServiceName("");
    setServiceType("");
    setDescription("");
    setDate("");
    setRemark("");
  };

  // Fetch customers and services when modal is open
  const fetchDropdownData = async () => {
    try {
      const [customerRes, serviceRes] = await Promise.all([
        fetch("http://localhost:8000/customers"),
        fetch("http://localhost:8000/services"),
      ]);

      const [customersData, servicesData] = await Promise.all([
        customerRes.json(),
        serviceRes.json(),
      ]);

     

      setCustomers(customersData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  // Fetch sites based on selected customer
  useEffect(() => {
    if (customerName) {
      fetchSitesForCustomer(customerName);
    }
  }, [customerName]);

  const fetchSitesForCustomer = async (customerName: string) => {
    try {
      const response = await fetch(`http://localhost:8000/site?customerName=${encodeURIComponent(customerName)}`);
      const sitesData = await response.json();
      setSites(sitesData || []);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          siteName,
          serviceName,
          serviceType,
          description,
          date,
          remark,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get error message from server
        throw new Error(`Network response was not ok: ${errorText}`);
      }
  
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
        <h2 className="text-lg font-semibold mb-4">Add New Task</h2>

        {/* Customer Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Customer Name</label>
          <select
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a customer</option>
            {customers.map((customer, index) => (
              <option key={index} value={customer.customerName}>
                {customer.customerName}
              </option>
            ))}
          </select>
        </div>

        

        {/* Site Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Site Name</label>
          <select
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.siteName}>
                {site.siteName}
              </option>
            ))}
          </select>
        </div>

        {/* Service Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Service Name</label>
          <select
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a service</option>
            {services.map((service, index) => (
              <option key={index} value={service.serviceName}>
                {service.serviceName}
              </option>
            ))}
          </select>
        </div>

        {/* Service Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Service Type</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select a service type</option>
            {serviceTypes.map((type, index) => (
              <option key={index} value={type.serviceTypeName}>
                {type.serviceTypeName}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Remark */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Remark</label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
