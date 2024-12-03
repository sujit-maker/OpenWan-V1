"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaEllipsisV } from "react-icons/fa";
import CreateDeviceModal from "./CreateDeviceModal";
import EditDeviceModal from "./EditDeviceModal";
import { Device, Site } from "./types";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

const DeviceTable: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [connectLoading, setConnectLoading] = useState<boolean>(false); // New state for connect loading

  const { currentUserType, userId, managerId, adminId } = useAuth();
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of customers per page

  // Function to fetch sites based on user type
  const fetchDevices = async () => {
    if (!userId || !currentUserType) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      let url = "";
      if (currentUserType === "ADMIN" && adminId) {
        url = `http://localhost:8000/devices?adminId=${adminId}`;
      } else if (currentUserType === "MANAGER" && managerId) {
        url = `http://localhost:8000/devices?managerId=${managerId}`;
      } else if (currentUserType === "SUPERADMIN") {
        url = "http://localhost:8000/devices";
      }

      if (!url) {
        throw new Error("Invalid user type or missing user ID");
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }

      const data: Device[] = await response.json();
      setDevices(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites(); // Fetch customers when the component mounts
  }, []);

  useEffect(() => {
    if (currentUserType && userId) {
      fetchDevices(); // Fetch sites when user type and userId are available
    }
  }, [currentUserType, userId, adminId, managerId]);

  useEffect(() => {
    setFilteredDevices(
      devices.filter(
        (device) =>
          device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.deviceType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, devices]);

  const fetchSites = async () => {
    try {
      const response = await fetch("http://localhost:8000/site");
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }
      const data: Site[] = await response.json();
      setSites(data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        const response = await fetch(`http://localhost:8000/devices/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        fetchDevices();
      } catch (error) {
        console.error("Failed to delete device:", error);
      }
    }
  };

  const handleConnect = async (device: Device) => {
    setConnectLoading(true); // Set the connect loading state to true
    try {
      // Simulate the "connect" action (you can replace this with actual logic)
      await router.push(`/devices/${device.deviceId}`);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setConnectLoading(false); // Reset loading state after action is complete
    }
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(null); // Close dropdown if clicked outside
    }
  };

  const handleDeviceCreated = () => {
    fetchDevices();
  };

  const handleDropdownToggle = (siteId: number) => {
    setDropdownVisible((prev) => (prev === siteId ? null : siteId)); // Toggle visibility based on siteId
  };

  const handleDeviceUpdated = (updatedDevice: Device) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div
        className="container mx-auto px-8 py-6 lg:pl-72"
        style={{ marginTop: 80 }}
      >
        {" "}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-indigo-500  to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 mb-4 md:mb-0"
            style={{ marginTop: "-45px" }}
          >
            Add Device
          </button>

          <div className="relative mt-4 md:mt-0 " style={{ marginTop: "-5px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Devices..."
              className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48 md:w-72 transition-all duration-300 ease-in-out"
            />
            <FaSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-all duration-300 ease-in-out"
              size={22}
            />
          </div>
        </div>
        {/* Responsive table wrapper */}
        <div className="overflow-x-auto lg:overflow-visible ">
          <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg ">
            <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              <tr>
                <th className="border p-2 text-center">ID</th>
                <th className="border p-2 text-center">Device</th>
                <th className="border p-2 text-center">Site</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((device) => {
                const site = sites.find((site) => site.id === device.siteId); // Find the site by ID
                return (
                  <tr key={device.id}>
                    <td className="border p-2 text-center">
                      {device.deviceId}
                    </td>
                    <td className="border p-2 text-center">
                      {device.deviceName}
                    </td>
                    <td className="border p-2 text-center">
                      {site ? site.siteName : "N/A"}
                    </td>{" "}
                    <td className="border p-3 relative flex justify-center  items-center">
                      <FaEllipsisV
                        className="text-gray-500 cursor-pointer "
                        onClick={() => handleDropdownToggle(device.id)}
                      />
                      {dropdownVisible === device.id && (
                        <div
                          ref={dropdownRef} // Attach ref here
                          className="absolute z-50 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-md w-40"
                          style={{ top: "-40px", left: "-20px", zIndex: 50 }}
                        >
                          <ul>
                            <li
                              onClick={() => handleConnect(device)}
                              className="px-4 py-2 text-blue-500 cursor-pointer hover:bg-gray-100"
                            >
                              Connect
                            </li>

                            <li
                              onClick={() => handleEdit(device)}
                              className="px-4 py-2 text-blue-500 cursor-pointer hover:bg-gray-100"
                            >
                              Edit
                            </li>

                            <li
                              onClick={() => handleDelete(device.id)}
                              className="px-4 py-2 text-red-500 cursor-pointer hover:bg-gray-100"
                            >
                              Delete
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
        {isCreateModalOpen && (
          <CreateDeviceModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onDeviceCreated={handleDeviceCreated}
          />
        )}
        {isEditModalOpen && selectedDevice && (
          <EditDeviceModal
            device={selectedDevice}
            onDeviceUpdated={handleDeviceUpdated}
            closeModal={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default DeviceTable;
