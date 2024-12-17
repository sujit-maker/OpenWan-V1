"use client";;
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import CreateServiceModal from "./CreateServiceModal";
import EditServiceModal from "./EditServiceModal";
import Header from "../components/Header";
import { Service } from "./types"; 

  const ServiceTable: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setFilteredServices(
      services.filter(
        (service) =>
          service.serviceName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          service.serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, services]);

  const fetchServices = async () => {
    try {
      const response = await fetch("http://122.169.108.252:8000/services");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Service[] = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const response = await fetch(`http://122.169.108.252:8000/services/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        fetchServices();
      } catch (error) {
        console.error("Failed to delete service:", error);
      }
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleServiceCreated = () => {
    fetchServices();
  };

  const handleServiceUpdated = (updatedService: Service) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === updatedService.id ? updatedService : service
      )
    );
  };

  return (
    <div
    className="container mx-auto px-8 py-6 lg:pl-72"
    style={{ marginTop: 80 }}
    >
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4  py-2 rounded shadow hover:bg-blue-600 transition mb-4 md:mb-0"
        >
          Add Service
        </button>
        <div className="relative mt-4 md:mt-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="pl-8 pr-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
          />
          <FaSearch
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div>
      </div>
      <div className="overflow-x-auto lg:overflow-hidden lg:-ml-10 ml-14">
  <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg lg:ml-0">
          {" "}
          <thead className="bg-gray-400">
            <tr>
              <th className="border p-2">Service ID</th>
              <th className="border p-2">Service Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id}>
                <td className="border p-2 text-center">{service.serviceId}</td>
                <td className="border p-2 text-center">{service.serviceName}</td>
                <td className="border p-2 text-center">{service.description}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isCreateModalOpen && (
        <CreateServiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onServiceCreated={handleServiceCreated}
        />
      )}
      {isEditModalOpen && selectedService && (
        <EditServiceModal
          service={selectedService}
          onServiceUpdated={handleServiceUpdated}
          closeModal={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ServiceTable;
