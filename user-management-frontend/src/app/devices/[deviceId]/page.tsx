// src/app/devices/[deviceId]/page.tsx
"use client";
import Sidebar from "@/app/components/Sidebar";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";

type DeviceData = {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  deviceIp: string;
  devicePort: string;
  deviceUsername: string;
  devicePassword: string;
};

const DeviceDetails = ({ params }: { params: { deviceId: string } }) => {
  const { deviceId } = params;
  const router = useRouter();

  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch(
          `http://40.0.0.109:8000/devices/${deviceId}`,
          {
            next: { revalidate: 10 },
          }
        );

        if (!response.ok) {
          throw new Error("Device not found");
        }

        const data: DeviceData = await response.json();
        setDeviceData(data);
      } catch (error) {
        console.error(error);
        setDeviceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [deviceId]);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!deviceData) {
    return <div className="text-center">Device not found.</div>;
  }

  const handleBackClick = () => {
    router.push("/device");
  };

  return (
    <>
      <Sidebar />
      <div className="container mt-5">
        <h1 className="text-center mb-4">Device Details</h1>
        <div className="text-center mb-3">
          <button
            onClick={handleBackClick}
            className="btn btn-primary"
            aria-label="Back to device list"
          >
            Back
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered text-center mx-auto" style={{ maxWidth: "600px" }}>
            <tbody>
              <tr>
                <th scope="row">Device Name</th>
                <td>{deviceData.deviceName}</td>
              </tr>
              <tr>
                <th scope="row">Type</th>
                <td>{deviceData.deviceType}</td>
              </tr>
              <tr>
                <th scope="row">IP</th>
                <td>{deviceData.deviceIp}</td>
              </tr>
              <tr>
                <th scope="row">Port</th>
                <td>{deviceData.devicePort}</td>
              </tr>
              <tr>
                <th scope="row">Username</th>
                <td>{deviceData.deviceUsername}</td>
              </tr>
              <tr>
                <th scope="row">Password</th>
                <td>{deviceData.devicePassword}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DeviceDetails;
