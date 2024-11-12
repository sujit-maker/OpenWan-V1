import React, { useState } from 'react';
import { Device } from './types'; 

interface EditDeviceModalProps {
  device: Device;
  onDeviceUpdated: (device: Device) => void;
  closeModal: () => void;
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  device,
  onDeviceUpdated,
  closeModal,
}) => {
  const [updatedDevice, setUpdatedDevice] = useState<Device>(device);

  const handleInputChange = (field: string, value: string) => {
    setUpdatedDevice((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://40.0.0.109:8000/devices/${updatedDevice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: updatedDevice.deviceId,
          deviceName: updatedDevice.deviceName,
          deviceType: updatedDevice.deviceType,
          deviceIp: updatedDevice.deviceIp,
          devicePort: updatedDevice.devicePort,
          portCount : updatedDevice.portCount,
          deviceUsername: updatedDevice.deviceUsername,
          devicePassword: updatedDevice.devicePassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${errorData.message || 'Failed to update device'}`);
      }

      const updatedDeviceData = await response.json();
      onDeviceUpdated(updatedDeviceData); 
      closeModal(); 
    } catch (error) {
      console.error('Failed to update device:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Device</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Device ID</label>
          <input
            type="text"
            value={updatedDevice.deviceId}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Device Name</label>
          <input
            type="text"
            value={updatedDevice.deviceName}
            onChange={(e) => handleInputChange('deviceName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Device Type</label>
          <input
            type="text"
            value={updatedDevice.deviceType}
            onChange={(e) => handleInputChange('deviceType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Device IP</label>
          <input
            type="text"
            value={updatedDevice.deviceIp}
            onChange={(e) => handleInputChange('deviceIp', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Device Port</label>
          <input
            type="text"
            value={updatedDevice.devicePort}
            onChange={(e) => handleInputChange('devicePort', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Number of Wan</label>
          <input
            type="text"
            value={updatedDevice.portCount}
            onChange={(e) => handleInputChange('portCount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Device Username</label>
          <input
            type="text"
            value={updatedDevice.deviceUsername}
            onChange={(e) => handleInputChange('deviceUsername', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Device Password</label>
          <input
            type="text"
            value={updatedDevice.devicePassword}
            onChange={(e) => handleInputChange('devicePassword', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded shadow mr-2 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDeviceModal;
