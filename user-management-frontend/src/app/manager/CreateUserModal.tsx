import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  managerId: number; 
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const managerId = localStorage.getItem('managerId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username,
      password,
      usertype: 'EXECUTIVE',
      managerId: managerId ? parseInt(managerId) : undefined,
    };

    try {
      const response = await fetch('http://40.0.0.25:8000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('User created successfully!');
        setError(null);
        onUserCreated();
        resetForm();
        setTimeout(onClose, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'An error occurred while creating the user.');
        setSuccess(null);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError('An unexpected error occurred.');
      setSuccess(null);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]" // Updated to z-[9999] for even higher z-index
        aria-labelledby="create-user-title"
        aria-describedby="create-user-description"
      >
        <Dialog.Panel className="max-w-sm w-full bg-white rounded-lg shadow-lg p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">Create User</Dialog.Title>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded p-2 mt-1"
              />
            </div>
           
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateUserModal;
