import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: () => void;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onServiceCreated,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      serviceName,
      description,
    };

    try {
      setIsLoading(true);
      const response = await fetch('http://122.169.108.252:8000/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Service created successfully!');
        setError(null);
        onServiceCreated();
        resetForm();
        setTimeout(onClose, 2000);
      } else {
        setError(data.message || 'An error occurred while creating the service.');
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
    setServiceName('');
    setDescription('');
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]"
        aria-labelledby="create-service-title"
        aria-describedby="create-service-description"
      >
        <Dialog.Panel className="max-w-sm w-full bg-white rounded-lg shadow-lg p-6">
          <Dialog.Title id="create-service-title" className="text-xl font-semibold mb-4">
            Add New Service
          </Dialog.Title>
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-2 rounded mb-4" role="alert" aria-live="assertive">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="serviceName" className="block text-gray-700">
                Service Name
              </label>
              <input
                id="serviceName"
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                className={`bg-blue-500 text-white rounded px-4 py-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Add Service'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateServiceModal;
