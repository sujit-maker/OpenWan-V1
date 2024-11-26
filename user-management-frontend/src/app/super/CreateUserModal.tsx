import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';



interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: { id: number; username: string }) => void;
  managers: Manager[]; 
}
interface Manager {
  id: number;
  username: string;
}


const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('ADMIN');
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [managers, setManagers] = useState<{ id: number; username: string }[]>([]);
  const [admins, setAdmins] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchManagers = async () => {
        try {
          const response = await fetch('http://40.0.0.109:8000/users/managers');
          if (response.ok) {
            const data = await response.json();
            setManagers(data);
          } else {
            setError('Failed to load managers.');
          }
        } catch (err) {
          setError('An error occurred while fetching managers.');
        }
      };

      const fetchAdmins = async () => {
        try {
          const response = await fetch('http://40.0.0.109:8000/users/admins');
          if (response.ok) {
            const data = await response.json();
            setAdmins(data);
          } else {
            setError('Failed to load admins.');
          }
        } catch (err) {
          setError('An error occurred while fetching admins.');
        }
      };

      fetchManagers();
      fetchAdmins();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validation for dropdown selections
    if (usertype === 'EXECUTIVE' && (!selectedAdminId || !selectedManagerId)) {
      setError('Please select both an Admin and a Manager for the Executive.');
      return;
    }
  
    if (usertype === 'MANAGER' && !selectedAdminId) {
      setError('Please select an Admin for the Manager.');
      return;
    }
  
    // Construct the payload
    const payload = {
      username,
      password,
      usertype,
      adminId: usertype === 'EXECUTIVE' || usertype === 'MANAGER' ? selectedAdminId : null,
      managerId: usertype === 'EXECUTIVE' ? selectedManagerId : null,
    };
  
    try {
      const response = await fetch('http://40.0.0.109:8000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const newUser = await response.json();
        setSuccess('User created successfully!');
        setError(null);
        onUserCreated(newUser); // Notify parent about the new user
        resetForm();
  
        // Clear success message and close modal after 2 seconds
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 2000);
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
    setUsertype('ADMIN');
    setSelectedManagerId(null);
    setSelectedAdminId(null);
    setError(null);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]"
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
            <div className="mb-4">
  <label htmlFor="usertype" className="block text-gray-700">User Type</label>
  <select
    id="usertype"
    value={usertype}
    onChange={(e) => {
      setUsertype(e.target.value);
      // Reset selections when user type changes
      setSelectedAdminId(null);
      setSelectedManagerId(null);
    }}
    className="w-full border rounded p-2 mt-1"
  >
    <option value="ADMIN">Admin</option>
    <option value="MANAGER">Manager</option>
    <option value="EXECUTIVE">Executive</option>
  </select>
</div>

{usertype === 'EXECUTIVE' && (
  <>
    {/* Admin Dropdown */}
    <div className="mb-4">
      <label htmlFor="admin" className="block text-gray-700">Select Admin</label>
      <select
        id="admin"
        value={selectedAdminId || ''}
        onChange={(e) => setSelectedAdminId(Number(e.target.value))}
        className="w-full border rounded p-2 mt-1"
      >
        <option value="">--Select Admin--</option>
        {admins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.username}
          </option>
        ))}
      </select>
    </div>

    {/* Manager Dropdown */}
    <div className="mb-4">
      <label htmlFor="manager" className="block text-gray-700">Select Manager</label>
      <select
        id="manager"
        value={selectedManagerId || ''}
        onChange={(e) => setSelectedManagerId(Number(e.target.value))}
        className="w-full border rounded p-2 mt-1"
      >
        <option value="">--Select Manager--</option>
        {managers.map((manager) => (
          <option key={manager.id} value={manager.id}>
            {manager.username}
          </option>
        ))}
      </select>
    </div>
  </>
)}

{usertype === 'MANAGER' && (
  <>
    {/* Admin Dropdown for Managers */}
    <div className="mb-4">
      <label htmlFor="admin" className="block text-gray-700">Select Admin</label>
      <select
        id="admin"
        value={selectedAdminId || ''}
        onChange={(e) => setSelectedAdminId(Number(e.target.value))}
        className="w-full border rounded p-2 mt-1"
      >
        <option value="">--Select Admin--</option>
        {admins.map((admin) => (
          <option key={admin.id} value={admin.id}>
            {admin.username}
          </option>
        ))}
      </select>
    </div>
  </>
)}


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
