// SiteTable.tsx
"use client";
import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import CreateSiteModal from "./CreateSiteModal";
import EditSiteModal from "./EditSiteModal";
import { Customer, Site } from "./types"; // Adjust path as needed
import Header from "../components/Header";

const SiteTable: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetchSites();
    fetchCustomers(); // Fetch customers on component mount
  }, []);

  useEffect(() => {
    // Filter sites based on the search query
    setFilteredSites(
      sites.filter((site) =>
        site.siteName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, sites]);

  const fetchSites = async () => {
    try {
      const response = await fetch("http://40.0.0.109:8000/site");
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }
      const data: Site[] = await response.json();
      setSites(data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://40.0.0.109:8000/customers");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleSiteCreated = (site: Site) => {
    setSites((prevSites) => [...prevSites, site]);
    fetchSites(); // Ensure the latest data is fetched
  };

  const handleSiteUpdated = (updatedSite: Site) => {
    setSites((prevSites) =>
      prevSites.map((site) => (site.id === updatedSite.id ? updatedSite : site))
    );
    setEditingSite(null); // Close the edit modal
    fetchSites(); // Ensure the latest data is fetched
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://40.0.0.109:8000/site/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete site");
      }
      setSites((prevSites) => prevSites.filter((site) => site.id !== id));
      fetchSites(); // Ensure the latest data is fetched
    } catch (error) {
      console.error("Error deleting site:", error);
    }
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
            className="bg-blue-500 text-white px-4 mx-16 py-2 rounded shadow hover:bg-blue-600 transition mb-4 md:mb-0"
          >
            Add Site
          </button>
          <div className="relative mt-4 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search site..."
              className="pl-8 pr-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
            />
            <FaSearch
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
          </div>
        </div>

        <div className="overflow-x-auto lg:overflow-hidden ml-14">
          {/* Added mobile-scroll class */}
          <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg ml-2">
            {" "}
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2 ">Site</th>
                <th className="border p-2 ">Customer</th>
                <th className="border p-2 ">Address</th>
                <th className="border p-2 ">Contact Name</th>
                <th className="border p-2 ">Contact Number</th>
                <th className="border p-2 ">Email</th>
                <th className="border p-2 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site) => (
                <tr key={site.id}>
                  <td className="border p-2 text-center">{site.siteName}</td>
                  <td className="border p-2 text-center">
                    {site.customer ? site.customer.customerName : "N/A"}
                  </td>
                  <td className="border p-2 text-center">{site.siteAddress}</td>
                  <td className="border p-2 text-center">{site.contactName}</td>
                  <td className="border p-2 text-center">{site.contactNumber}</td>
                  <td className="border p-2 text-center">{site.contactEmail}</td>
                  <td className="border p-2 text-center">
                  <button
                      onClick={() => setEditingSite(site)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(site.id)}
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
