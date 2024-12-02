// SiteTable.tsx
"use client";
import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import CreateSiteModal from "./CreateSiteModal";
import EditSiteModal from "./EditSiteModal";
import { Customer, Site } from "./types";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

const SiteTable: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUserType, userId, managerId, adminId } = useAuth();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of customers per page

  // Function to fetch sites based on user type
  const fetchSites = async () => {
    if (!userId || !currentUserType) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      let url = "";
      if (currentUserType === "ADMIN" && adminId) {
        url = `http://localhost:8000/site?adminId=${adminId}`;
      } else if (currentUserType === "MANAGER" && managerId) {
        url = `http://localhost:8000/site?managerId=${managerId}`;
      } else if (currentUserType === "SUPERADMIN") {
        url = "http://localhost:8000/site"; // Fetch all sites for SUPERADMIN
      }

      if (!url) {
        throw new Error("Invalid user type or missing user ID");
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }

      const data: Site[] = await response.json();
      setSites(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(); // Fetch customers when the component mounts
  }, []);

  // Function to fetch customers (separate from sites)
  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:8000/customers");
      if (!response.ok) {
        console.error(`Failed to fetch customers. Status: ${response.status}`);
        throw new Error("Failed to fetch customers");
      }
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    if (currentUserType && userId) {
      fetchSites(); // Fetch sites when user type and userId are available
    }
  }, [currentUserType, userId, adminId, managerId]);

  useEffect(() => {
    // Filter sites based on the search query
    setFilteredSites(
      sites.filter(
        (site) =>
          site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.siteAddress.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, sites]);

  const handleSiteCreated = (site: Site) => {
    setSites((prevSites) => [...prevSites, site]);
    fetchSites(); // Ensure the latest data is fetched after creation
  };

  const handleSiteUpdated = (updatedSite: Site) => {
    setSites((prevSites) =>
      prevSites.map((site) => (site.id === updatedSite.id ? updatedSite : site))
    );
    setEditingSite(null); // Close the edit modal
    fetchSites(); // Ensure the latest data is fetched after update
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this Site?")) {
      try {
        const response = await fetch(`http://localhost:8000/site/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete site");
        }
        setSites((prevSites) => prevSites.filter((site) => site.id !== id));
        fetchSites(); // Ensure the latest data is fetched after delete
      } catch (error) {
        console.error("Error deleting site:", error);
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredSites.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSites.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <>
      <div
        className="container mx-auto px-8 py-6 lg:pl-72"
        style={{ marginTop: 80 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <button
  onClick={() => setIsCreateModalOpen(true)}
  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 mb-4 md:mb-0"
>
            Add Site
          </button>
          <div className="relative mt-4 md:mt-0">
  <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search Sites..."
    className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48 md:w-72 transition-all duration-300 ease-in-out"
  />
  <FaSearch
    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-all duration-300 ease-in-out"
    size={22}
  />
</div>

        </div>

        <div className="overflow-x-auto lg:overflow-hidden">
  <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg">
    <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <tr>
        <th className="border px-4 py-3 text-left text-sm font-semibold">Site</th>
        <th className="border px-4 py-3 text-left text-sm font-semibold">Customer</th>
        <th className="border px-4 py-3 text-left text-sm font-semibold">Address</th>
        <th className="border px-4 py-3 text-left text-sm font-semibold">Name</th>
        <th className="border px-4 py-3 text-left text-sm font-semibold">Number</th>
        <th className="border px-4 py-3 text-left text-sm font-semibold">Email</th>
        <th className="border px-4 py-3 text-center text-sm font-semibold">Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentItems.map((site, index) => (
        <tr
          key={site.id}
          className={`hover:bg-gray-100 transition-colors ${
            index % 2 === 0 ? 'bg-gray-50' : ''
          }`}
        >
          <td className="border px-4 py-3 text-sm text-gray-800">{site.siteName}</td>
          <td className="border px-4 py-3 text-sm text-gray-800">
            {site.customer ? site.customer.customerName : "N/A"}
          </td>
          <td className="border px-4 py-3 text-sm text-gray-800">{site.siteAddress}</td>
          <td className="border px-4 py-3 text-sm text-gray-800">{site.contactName}</td>
          <td className="border px-4 py-3 text-sm text-gray-800">{site.contactNumber}</td>
          <td className="border px-4 py-3 text-sm text-gray-800">{site.contactEmail}</td>
          <td className="border px-4 py-3 text-center">
            <button
              onClick={() => setEditingSite(site)}
              className="text-blue-500 hover:text-blue-700 transition-colors mx-2"
              aria-label="Edit site"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(site.id)}
              className="text-red-500 hover:text-red-700 transition-colors mx-2"
              aria-label="Delete site"
            >
              <FaTrash />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        {/* Pagination controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Prev
          </button>
          <span className="px-4 py-2">{currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>

        <CreateSiteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSiteCreated={handleSiteCreated}
          fetchSites={fetchSites}
        />

        {editingSite && (
          <EditSiteModal
            isOpen={!!editingSite}
            site={editingSite}
            customers={customers}
            onSiteUpdated={handleSiteUpdated}
            closeModal={() => setEditingSite(null)}
            fetchSites={fetchSites}
          />
        )}
      </div>
    </>
  );
};

export default SiteTable;
