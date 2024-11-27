"use client";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSearch, FaLink } from "react-icons/fa";
import CreateDeviceModal from "./CreateDeviceModal";
import EditDeviceModal from "./EditDeviceModal";
import Header from "../components/Header";
import { Device, Site } from "./types";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

const DeviceTable: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchDevices();
    fetchSites();
  }, []);

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

  const fetchDevices = async () => {
    try {
      const response = await fetch("http://localhost:8000/devices");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Device[] = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  };

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

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  const handleConnect = (device: Device) => {
    router.push(`/devices/${device.deviceId}`);
  };

  const handleDeviceCreated = () => {
    fetchDevices();
  };

  const handleDeviceUpdated = (updatedDevice: Device) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
  };

  return (
    <>
      <Header />
      <Sidebar />
      <div
        className="container mx-auto px-8 py-6 lg:pl-72"
        style={{ marginTop: 80 }}
      >     <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 text-white px-4 mx-14 py-2 rounded shadow hover:bg-blue-600 transition mb-4 md:mb-0"
          >
            Add Device
          </button>

          <div className="relative mt-4 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devices..."
              className="pl-8 pr-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 md:w-64"
            />
            <FaSearch
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
          </div>
        </div>

        {/* Responsive table wrapper */}
        <div className="overflow-x-auto w-full px-8 lg:px-8 ml-8">
          <table className="min-w-full bg-white shadow-lg rounded-lg">
            <thead className="bg-gray-400">
              <tr>
                <th className="border p-2 text-center">Device ID</th>
                <th className="border p-2 text-center">Device Name</th>
                <th className="border p-2 text-center">Site Name</th>
                <th className="border p-2 text-center">Device Type</th>
                <th className="border p-2 text-center">Port Count</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
  {filteredDevices.map((device) => {
    const site = sites.find((site) => site.id === device.siteId); // Find the site by ID
    return (
      <tr key={device.id}>
        <td className="border p-2 text-center">{device.deviceId}</td>
        <td className="border p-2 text-center">{device.deviceName}</td>
        <td className="border p-2 text-center">{site ? site.siteName : "N/A"}</td> {/* Display siteName */}
        <td className="border p-2 text-center">{device.deviceType}</td>
        <td className="border p-2 text-center">{device.portCount}</td>
        <td className="border p-2 text-center">
          <button
            onClick={() => handleConnect(device)}
            className="text-yellow-500 hover:text-yellow-700 mr-3"
            title="Connect"
          >
            <FaLink />
          </button>
          <button
            onClick={() => handleEdit(device)}
            className="text-blue-500 hover:text-blue-700 mr-3"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(device.id)}
            className="text-red-500 hover:text-red-700 mr-3"
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

          </table>
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
