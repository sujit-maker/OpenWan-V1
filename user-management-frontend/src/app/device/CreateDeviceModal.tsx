import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceCreated: () => void;
}

const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({
  isOpen,
  onClose,
  onDeviceCreated,
}) => {
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [devicePort, setDevicePort] = useState('');
  const [portCount, setPortCount] = useState ('');
  const [deviceUsername, setDeviceUsername] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      deviceName,
      deviceType,
      deviceIp,
      devicePort,
      portCount,
      deviceUsername,
      devicePassword,
    };

    try {
      setIsLoading(true);
      const response = await fetch('http://40.0.0.25:8000/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        // Create the success message with the device URL
        const deviceUrl = `/devices/${data.deviceId}`;
        setSuccess(`Device created successfully!`);
        setError(null);
        onDeviceCreated();
        resetForm();
       
        setTimeout(onClose, 2000); 
      } else {
        setError(data.message || 'An error occurred while creating the device.');
        setSuccess(null);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDeviceName('');
    setDeviceType('');
    setDeviceIp('');
    setDevicePort('');
    setPortCount ('');
    setDeviceUsername('');
    setDevicePassword('');
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]"
        aria-labelledby="create-device-title"
      >
        <Dialog.Panel className="max-w-sm w-full bg-white rounded-lg shadow-lg p-6">
          <Dialog.Title id="create-device-title" className="text-xl font-semibold mb-4">
            Add New Device
          </Dialog.Title>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-2 rounded mb-4" role="alert">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="deviceName" className="block text-gray-700">Device Name</label>
              <input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="deviceType" className="block text-gray-700">Device Type</label>
              <input
                id="deviceType"
                type="text"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="deviceIp" className="block text-gray-700">Device IP</label>
              <input
                id="deviceIp"
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="devicePort" className="block text-gray-700">Device Port</label>
              <input
                id="devicePort"
                type="text"
                value={devicePort}
                onChange={(e) => setDevicePort(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="portCount" className="block text-gray-700">Number Of Wan</label>
              <input
                id="portCount"
                type="text"
                value={portCount}
                onChange={(e) => setPortCount(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="deviceUsername" className="block text-gray-700">Device Username</label>
              <input
                id="deviceUsername"
                type="text"
                value={deviceUsername}
                onChange={(e) => setDeviceUsername(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="devicePassword" className="block text-gray-700">Device Password</label>
              <input
                id="devicePassword"
                type="password"
                value={devicePassword}
                onChange={(e) => setDevicePassword(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 bg-gray-300 text-black rounded px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-blue-500 text-white rounded px-4 py-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Add Device'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateDeviceModal;
