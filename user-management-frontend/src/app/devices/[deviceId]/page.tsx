"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { FaDownload } from "react-icons/fa"; // Import the download icon
import * as XLSX from "xlsx"; // Import xlsx for Excel file creation

interface DeviceData {
  date: string;
  uptime: string;
  osVersion: string;
  cpuLoad: string;
  freeMemory: string;
  totalMemory: string;
  name: string;

  wan1: {
    address: string;
    status: string;
    internet: string;
    running: string;
  };

  wan2: {
    address: string;
    status: string;
    internet: string;
    running: string;
  };
}

interface WanLog {
  id: number;
  identity: string;
  comment: string;
  status: string;
  since: string;
  createdAt: string;
}

const DeviceDetails: React.FC = () => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const { deviceId } = useParams();
  const [wanLogs, setWanLogs] = useState<WanLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(true);

  const router = useRouter();

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(wanLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WAN Logs");
  
    // Create a file and download it
    XLSX.writeFile(workbook, "WAN_Logs.xlsx");
  };
  

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch(
          `http://40.0.0.25:8000/devices/${deviceId}/data`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch device data");
        }
        const data = await response.json();

        const filteredData = {
          date: `${data["system/clock"].date} ${data["system/clock"].time}` || "N/A",
          uptime: `${data["system/resource"].uptime}` || "N/A",
          osVersion: `${data["system/resource"].version}` || "N/A",
          cpuLoad: `${data["system/resource"]["cpu-load"]}` || "N/A",
          freeMemory: `${(data["system/resource"]["free-memory"] / (1024 * 1024)).toFixed(2)} MB` || "N/A",
          totalMemory: `${(data["system/resource"]["total-memory"] / (1024 * 1024)).toFixed(2)} MB` || "N/A",
          name: data["system/identity"]["name"] || "N/A",
          wan1: { address: "N/A", status: "Disconnected", internet: "Disconnected", running: "N/A" },
          wan2: { address: "N/A", status: "Disconnected", internet: "Disconnected", running: "N/A" },
        };


        // Fetch WAN IP details directly for WAN1
        try {
          const wan1IpResponse = await fetch(
            `http://40.0.0.25:8000/devices/${deviceId}/wan-ip?wan=WAN1`
          );
          if (wan1IpResponse.ok) {
            const wan1IpData = await wan1IpResponse.json();
            if (Array.isArray(wan1IpData) && wan1IpData.length > 0) {
              filteredData.wan1.address = wan1IpData[0].address || "N/A";
              filteredData.wan1.status = "Connected";
            } else {
              console.warn(
                "WAN1 IP data is not in expected format or is empty:",
                wan1IpData
              );
            }
          } else {
            console.error("Error fetching WAN1 IP:", wan1IpResponse.statusText);
          }
        } catch (error) {
          console.error("Error fetching WAN1 IP details:", error);
        }

        // Fetch WAN IP details directly for WAN2
        try {
          const wan2IpResponse = await fetch(
            `http://40.0.0.25:8000/devices/${deviceId}/wan-ip?wan=WAN2`
          );
          if (wan2IpResponse.ok) {
            const wan2IpData = await wan2IpResponse.json();
            if (Array.isArray(wan2IpData) && wan2IpData.length > 0) {
              filteredData.wan2.address = wan2IpData[0].address || "N/A";
              filteredData.wan2.status = "Connected";
            } else {
              console.warn(
                "WAN2 IP data is not in expected format or is empty:",
                wan2IpData
              );
            }
          } else {
            console.error("Error fetching WAN2 IP:", wan2IpResponse.statusText);
          }
        } catch (error) {
          console.error("Error fetching WAN2 IP details:", error);
        }

        // Fetch Netwatch status for both WANs
        try {
          const netwatchResponse = await fetch(
            `http://40.0.0.25:8000/devices/${deviceId}/tool/netwatch`
          );
          if (netwatchResponse.ok) {
            const netwatchData = await netwatchResponse.json();
            const wan1Status = netwatchData.find(
              (entry: any) => entry.comment === "WAN1"
            );
            const wan2Status = netwatchData.find(
              (entry: any) => entry.comment === "WAN2"
            );

            if (wan1Status) {
              filteredData.wan1.internet = wan1Status.status || "N/A";
            }
            if (wan2Status) {
              filteredData.wan2.internet = wan2Status.status || "N/A";
            }
          } else {
            console.error(
              "Error fetching netwatch data:",
              netwatchResponse.statusText
            );
          }
        } catch (error) {
          console.error("Error fetching netwatch details:", error);
        }

        // Fetch interface data to get the running status
        try {
          const interfaceResponse = await fetch(
            `http://40.0.0.25:8000/devices/${deviceId}/interface`
          );
          if (interfaceResponse.ok) {
            const interfaceData = await interfaceResponse.json();

            // Assuming interfaceData is an array and includes WAN1 and WAN2
            const wan1Interface = interfaceData.find(
              (entry: any) => entry.name === "WAN1"
            );
            const wan2Interface = interfaceData.find(
              (entry: any) => entry.name === "WAN2"
            );

            // Check the running status for WAN1
            if (wan1Interface) {
              filteredData.wan1.running = wan1Interface.running
                ? "Running"
                : "Not Running";
            } else {
              console.warn("WAN1 interface data not found");
            }

            // Check the running status for WAN2
            if (wan2Interface) {
              filteredData.wan2.running = wan2Interface.running
                ? "Running"
                : "Not Running";
            } else {
              console.warn("WAN2 interface data not found");
            }
          } else {
            console.error(
              "Error fetching interface data:",
              interfaceResponse.statusText
            );
          }
        } catch (error) {
          console.error("Error fetching interface details:", error);
        }

        setDeviceData(filteredData);
      } catch (error) {
        console.error("Error fetching device data:", error);
      }
    };

    
    const handleShowLogs = async () => {
      try {
        setIsTableVisible(true);
        const response = await fetch(`http://40.0.0.25:8000/wanstatus`);
        if (!response.ok) {
          throw new Error("Failed to fetch WAN logs");
        }
        const data = await response.json();
        setWanLogs(data.data);
        setShowLogs(true);
      } catch (error) {
        console.error("Error fetching WAN logs:", error);
      }
    };

    if (deviceId) {
      fetchDeviceData();
      handleShowLogs();

      // Set up polling to refresh data every 5 seconds
      const interval = setInterval(() => {
        fetchDeviceData();
        handleShowLogs();
      }, 5000);

      // Clear interval on component unmount
      return () => clearInterval(interval);
    }
  }, [deviceId]);

  if (!deviceData)
    return (
      <div className="flex items-center text-3xl  font-semibold justify-center h-screen">
        <h1>Loading Device Data...</h1>
      </div>
    );

  const backme = () => {
    router.push("/device");
  };

  

  return (
    <>
      <Header />
      <Sidebar />

      <div className="  mx-auto px-24 py-24">
        <div className="flex mx-6 my-0 justify-end">
          <button
            onClick={backme}
            className="bg-red-600  p-2 w-15 text-white rounded-md"
          >
            Back
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-8">
          Device Dashboard - {deviceId}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
          <div className="bg-gray-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full max-w-sm">
            {" "}
            <h2 className="text-lg text-black font-semibold mb-2">
              Date & Time{" "}
            </h2>
            <p className="text-black">{deviceData.date}</p>
            <h2 className="text-lg text-black font-semibold mb-2">Uptime</h2>
            <p className="text-black">{deviceData.uptime}</p>
          </div>

          <div className="bg-gray-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full max-w-sm">
            <h2 className="text-lg text-black font-semibold mb-2">
              Memory Usage
            </h2>
            <p className="text-black">
              {deviceData.totalMemory}/{deviceData.freeMemory}
            </p>
            <h2 className="text-lg text-black font-semibold mb-2">CPU Load</h2>
            <p className="text-black">{deviceData.cpuLoad}%</p>
          </div>

          <div className="bg-gray-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full max-w-sm">
            <h2 className="text-lg text-black font-semibold mb-2">
              OS Version
            </h2>
            <p className="text-black">{deviceData.osVersion}</p>
            <h2 className="text-lg  text-black font-semibold mb-2">Idenity</h2>
            <p className="text-black">{deviceData.name}</p>
          </div>

          {/* Card for WAN 1 */}
          <div
            className={`rounded-lg shadow-2xl p-4 border w-full max-w-sm ${
              deviceData.wan1.internet.toLowerCase() === "up"
                ? "bg-green-400"
                : "bg-red-500"
            }`}
          >
            <h2 className="text-lg font-semibold mb-2">WAN 1</h2>
            <p className="text-gray-900">
              IP : {deviceData.wan1.address}
            </p>
            <p className="text-black">Status: {deviceData.wan1.status}</p>
            <p className="text-black">Internet: {deviceData.wan1.internet}</p>
          </div>

          {/* Card for WAN 2 */}
          <div
            className={`rounded-lg shadow-2xl p-4 border border-gray-200 w-full max-w-sm ${
              deviceData.wan2.internet.toLowerCase() === "up"
                ? "bg-green-400"
                : "bg-red-500"
            }`}
          >
            <h2 className="text-lg font-semibold  mb-2">WAN 2</h2>
            <p className="text-gray-900">
              IP : {deviceData.wan2.address}
            </p>
            <p className="text-gray-900">Status: {deviceData.wan2.status}</p>
            <p className="text-gray-900">
              Internet: {deviceData.wan2.internet}
            </p>
          </div>

          {/* <label>Wan Status</label> */}
          <select
            onChange={(e) => {
              if (e.target.value === "wan") {
              }
            }}
            className="cursor-pointer"
          >
            <option className="cursor-pointer" value="wan">
              WAN Status
            </option>
          </select>
        </div>

        {showLogs && wanLogs.length > 0 && (
          <div className="mt-8">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">WAN Logs</h2>
      <button onClick={handleDownload} className="text-blue-500 hover:text-blue-700">
        <FaDownload className="inline mr-2" /> Download
      </button>
    </div>
    {isTableVisible && (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border min-w-max">
          <thead className="bg-gray-400">
            <tr>
              <th className="border p-2 text-center text-sm md:text-base">Date & Time</th>
              <th className="border p-2 text-center text-sm md:text-base">Identity</th>
              <th className="border p-2 text-center text-sm md:text-base">Comment</th>
              <th className="border p-2 text-center text-sm md:text-base">Status</th>
              <th className="border p-2 text-center text-sm md:text-base">Since</th>
            </tr>
          </thead>
          <tbody>
            {wanLogs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2 text-center text-sm md:text-base">{log.createdAt}</td>
                <td className="border p-2 text-center text-sm md:text-base">{log.identity}</td>
                <td className="border p-2 text-center text-sm md:text-base">{log.comment}</td>
                <td className="border p-2 text-center text-sm md:text-base">{log.status}</td>
                <td className="border p-2 text-center text-sm md:text-base">{log.since}</td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
        )}
      </div>
    </>
  );
};

export default DeviceDetails;
