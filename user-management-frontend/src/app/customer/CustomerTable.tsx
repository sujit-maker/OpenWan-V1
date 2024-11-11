"use client";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import CreateCustomerModal from "./CreateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import Header from "../components/Header";
import { Customer } from "./types"; 

const CustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setFilteredCustomers(
      customers.filter(
        (customer) =>
          customer.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.customerAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://40.0.0.25:8000/customers");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(`http://40.0.0.25:8000/customers/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        fetchCustomers();
      } catch (error) {
        console.error("Failed to delete customer:", error);
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleCustomerCreated = () => {
    fetchCustomers();
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  };

  return (
    <>
      <Header />
      <div
        className="container mx-auto px-8 py-6 lg:pl-72"
        style={{ marginTop: 80 }}
      >        
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 mx-14 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition mb-4 md:mb-0"
          >
            Add Customer
          </button>
          <div className="relative mt-4 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer..."
              className="pl-8 pr-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
            />
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>
        <div className="overflow-x-auto lg:overflow-hidden ml-14">
          
           {/* Control overflow based on screen size */}
          <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg ">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-1 ">Customer</th>
                <th className="border p-1 ">Address</th>
                <th className="border p-1 ">GST NO.</th>
                <th className="border p-1 ">Contact Name</th>
                <th className="border p-1 ">Contact Number</th>
                <th className="border p-1 ">Email</th>
                <th className="border p-1 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="border p-3 text-center">{customer.customerName}</td>
                  <td className="border p-3 text-center">{customer.customerAddress}</td>
                  <td className="border p-3 text-center">{customer.gstNumber}</td>
                  <td className="border p-3 text-center">{customer.contactName}</td>
                  <td className="border p-3 text-center">{customer.contactNumber}</td>
                  <td className="border p-3 text-center">{customer.email}</td>
                  <td className="border p-3 text-center">
                    <button onClick={() => handleEdit(customer)} className="text-blue-500 hover:text-blue-700 m-1">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="text-red-500 hover:text-red-700 m-1">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isCreateModalOpen && (
          <CreateCustomerModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCustomerCreated={handleCustomerCreated}
          />
        )}
        {isEditModalOpen && selectedCustomer && (
          <EditCustomerModal
            customer={selectedCustomer}
            onCustomerUpdated={handleCustomerUpdated}
            closeModal={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default CustomerTable;
