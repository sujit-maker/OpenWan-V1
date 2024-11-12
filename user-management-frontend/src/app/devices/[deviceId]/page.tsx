"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { FaDownload } from "react-icons/fa";
import * as XLSX from "xlsx";

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
    XLSX.writeFile(workbook, "WAN_Logs.xlsx");
  };

  const fetchWANDetails = async (wan: string) => {
    try {
      const response = await fetch(`http://40.0.0.25:8000/devices/${deviceId}/wan-ip?wan=${wan}`);
      if (response.ok) {
        const data = await response.json();
        return data[0] ? { address: data[0].address, status: "Connected" } : { address: "N/A", status: "Disconnected" };
      } else {
        console.error(`Error fetching ${wan} IP:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error fetching ${wan} IP details:`, error);
    }
    return { address: "N/A", status: "Disconnected" };
  };

  const fetchNetwatchStatus = async () => {
    try {
      const response = await fetch(`http://40.0.0.25:8000/devices/${deviceId}/tool/netwatch`);
      if (response.ok) {
        const data = await response.json();
        return {
          wan1: data.find((entry: any) => entry.comment === "WAN1")?.status || "N/A",
          wan2: data.find((entry: any) => entry.comment === "WAN2")?.status || "N/A",
          wan3: data.find((entry: any) => entry.comment === "WAN3")?.status || "N/A",
          wan4: data.find((entry: any) => entry.comment === "WAN4")?.status || "N/A",
        };
      } else {
        console.error("Error fetching netwatch data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching netwatch details:", error);
    }
    return { wan1: "N/A", wan2: "N/A", wan3: "N/A", wan4: "N/A" };
  };

  const fetchInterfaceStatus = async () => {
    try {
      const response = await fetch(`http://40.0.0.25:8000/devices/${deviceId}/interface`);
      if (response.ok) {
        const data = await response.json();
        return {
          wan1: data.find((entry: any) => entry.name === "WAN1")?.running ? "Running" : "Not Running",
          wan2: data.find((entry: any) => entry.name === "WAN2")?.running ? "Running" : "Not Running",
          wan3: data.find((entry: any) => entry.name === "WAN3")?.running ? "Running" : "Not Running",
          wan4: data.find((entry: any) => entry.name === "WAN4")?.running ? "Running" : "Not Running",
        };
      } else {
        console.error("Error fetching interface data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching interface details:", error);
    }
    return { wan1: "Not Running", wan2: "Not Running", wan3: "Not Running", wan4: "Not Running" };
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch(`http://40.0.0.25:8000/devices/${deviceId}/data`);
        if (!response.ok) throw new Error("Failed to fetch device data");
        const data = await response.json();

        const wan1 = await fetchWANDetails("WAN1");
        const wan2 = await fetchWANDetails("WAN2");
        const internetStatus = await fetchNetwatchStatus();
        const runningStatus = await fetchInterfaceStatus();

        setDeviceData({
          date: `${data["system/clock"].date} ${data["system/clock"].time}` || "N/A",
          uptime: data["system/resource"].uptime || "N/A",
          osVersion: data["system/resource"].version || "N/A",
          cpuLoad: data["system/resource"]["cpu-load"] || "N/A",
          freeMemory: (data["system/resource"]["free-memory"] / (1024 * 1024)).toFixed(2) + " MB" || "N/A",
          totalMemory: (data["system/resource"]["total-memory"] / (1024 * 1024)).toFixed(2) + " MB" || "N/A",
          name: data["system/identity"]["name"] || "N/A",
          wan1: {
            address: wan1.address,
            status: wan1.status,
            internet: internetStatus.wan1,
            running: runningStatus.wan1,
          },
          wan2: {
            address: wan2.address,
            status: wan2.status,
            internet: internetStatus.wan2,
            running: runningStatus.wan2,
          },
        });
      } catch (error) {
        console.error("Error fetching device data:", error);
      }
    };

    const fetchWanLogs = async () => {
      try {
        const response = await fetch(`http://40.0.0.25:8000/wanstatus`);
        if (!response.ok) throw new Error("Failed to fetch WAN logs");
        const data = await response.json();
        setWanLogs(data.data);
        setShowLogs(true);
      } catch (error) {
        console.error("Error fetching WAN logs:", error);
      }
    };

    if (deviceId) {
      fetchDeviceData();
      fetchWanLogs();

      const interval = setInterval(() => {
        fetchDeviceData();
        fetchWanLogs();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [deviceId]);

  if (!deviceData) return <div>Loading...</div>;

  const backme = () => {
    router.push("/device");
  };

  return (
    <>
    
      <Header />
      <Sidebar />
      <div className="mx-auto px-24 py-24">
        <div className="flex mx-6 my-0 justify-end">
          <button onClick={backme} className="bg-red-600 p-2 w-15 text-white rounded-md">
            Back
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-8">
          Device Dashboard - {deviceId}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
          {/* Device Data Cards */}
          <div className="bg-gray-400 rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-4 border border-gray-200 w-full max-w-sm">
            <h2 className="text-lg text-black font-semibold mb-2">Date & Time</h2>
            <p className="text-black">{deviceData.date}</p>
            <h2 className="text-lg text-black font-semibold mb-2">Uptime</h2>
            <p className="text-black">{deviceData.uptime}</p>
          </div>

          <div className="bg-gray-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full transform transition duration-300 hover:scale-105 hover:shadow-xl max-w-sm">
            <h2 className="text-lg text-black font-semibold mb-2">Memory Usage</h2>
            <p className="text-black">
              {deviceData.totalMemory}/{deviceData.freeMemory}
            </p>
            <h2 className="text-lg text-black font-semibold mb-2">CPU Load</h2>
            <p className="text-black">{deviceData.cpuLoad}%</p>
          </div>

          <div className="bg-gray-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full max-w-sm transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <h2 className="text-lg text-black font-semibold mb-2">OS Version</h2>
            <p className="text-black">{deviceData.osVersion}</p>
            <h2 className="text-lg text-black font-semibold mb-2">Identity</h2>
            <p className="text-black">{deviceData.name}</p>
          </div>

          {/* WAN 1 */}
          <div
            className={`bg-${deviceData.wan1.internet.toLowerCase() === "up" ? "green" : "red"}-400 rounded-lg shadow-2xl p-4 border w-full max-w-sm`}
          >
            <h2 className="text-lg font-semibold mb-2">WAN 1</h2>
            <p className="text-gray-900">IP Address: {deviceData.wan1.address}</p>
            <p className="text-black">Status: {deviceData.wan1.status}</p>
            <p className="text-black">Internet: {deviceData.wan1.internet}</p>
          </div>

          {/* WAN 2 */}
          <div
            className={`bg-${deviceData.wan2.internet.toLowerCase() === "up" ? "green" : "red"}-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full max-w-sm`}
          >
            <h2 className="text-lg font-semibold mb-2">WAN 2</h2>
            <p className="text-gray-900">IP Address: {deviceData.wan2.address}</p>
            <p className="text-black">Status: {deviceData.wan2.status}</p>
            <p className="text-black">Internet: {deviceData.wan2.internet}</p>
          </div>
        </div>

        {/* WAN Logs */}
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
