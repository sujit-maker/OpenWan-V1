"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("ADMIN");
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [managers, setManagers] = useState<{ id: number; username: string }[]>([]);
  const [admins, setAdmins] = useState<{ id: number; username: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchManagers = async () => {
        if (selectedAdminId) {
          try {
            const response = await fetch(
              `http://localhost:8000/users/managers/admin?adminId=${selectedAdminId}`
            );
            if (response.ok) {
              const data = await response.json();
              setManagers(data);
            } else {
              setError("Failed to load managers.");
            }
          } catch (err) {
            setError("An error occurred while fetching managers.");
          }
        }
      };

      const fetchAdmins = async () => {
        try {
          const response = await fetch("http://localhost:8000/users/admins");
          if (response.ok) {
            const data = await response.json();
            setAdmins(data);
          } else {
            setError("Failed to load admins.");
          }
        } catch (err) {
          setError("An error occurred while fetching admins.");
        }
      };

      fetchManagers();
      fetchAdmins();
    }
  }, [isOpen, selectedAdminId]); // Fetch admins and managers when the modal opens or adminId changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for dropdown selections
    if (usertype === "EXECUTIVE" && (!selectedAdminId || !selectedManagerId)) {
      setError("Please select both an Admin and a Manager for the Executive.");
      return;
    }

    if (usertype === "MANAGER" && !selectedAdminId) {
      setError("Please select an Admin for the Manager.");
      return;
    }

    // Construct the payload
    const payload = {
      username,
      password,
      usertype,
      adminId:
        usertype === "EXECUTIVE" || usertype === "MANAGER"
          ? selectedAdminId
          : null,
      managerId: usertype === "EXECUTIVE" ? selectedManagerId : null,
    };

    try {
      const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newUser = await response.json();
        setSuccess("User created successfully!");
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
        setError(data.message || "An error occurred while creating the user.");
        setSuccess(null);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An unexpected error occurred.");
      setSuccess(null);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setUsertype("ADMIN");
    setSelectedManagerId(null);
    setSelectedAdminId(null);
    setError(null);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
    <Dialog
      as="div"
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999] backdrop-blur-md"
      aria-labelledby="create-user-title"
      aria-describedby="create-user-description"
    >
      <Dialog.Panel className="max-w-sm w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-lg shadow-2xl p-6 transform transition-transform duration-300 hover:scale-105">
        <Dialog.Title className="text-2xl font-semibold text-white mb-6 text-center">
          Create User
        </Dialog.Title>
  
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 shadow-md">{error}</div>
        )}
  
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 shadow-md">{success}</div>
        )}
  
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
  
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
  
          <div className="mb-4">
            <label htmlFor="usertype" className="block text-sm font-medium text-white mb-1">
              User Type
            </label>
            <select
              id="usertype"
              value={usertype}
              onChange={(e) => {
                setUsertype(e.target.value);
                // Reset selections when user type changes
                setSelectedAdminId(null);
                setSelectedManagerId(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EXECUTIVE">Executive</option>
            </select>
          </div>
  
          {usertype === "EXECUTIVE" && (
            <>
              {/* Admin Dropdown for Executives */}
              <div className="mb-4">
                <label htmlFor="admin" className="block text-sm font-medium text-white mb-1">
                  Select Admin
                </label>
                <select
                  id="admin"
                  value={selectedAdminId || ""}
                  onChange={(e) => setSelectedAdminId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">--Select Admin--</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.username}
                    </option>
                  ))}
                </select>
              </div>
  
              {/* Manager Dropdown for Executives */}
              <div className="mb-4">
                <label htmlFor="manager" className="block text-sm font-medium text-white mb-1">
                  Select Manager
                </label>
                <select
                  id="manager"
                  value={selectedManagerId || ""}
                  onChange={(e) => setSelectedManagerId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  
          {usertype === "MANAGER" && (
            <>
              {/* Admin Dropdown for Managers */}
              <div className="mb-4">
                <label htmlFor="admin" className="block text-sm font-medium text-white mb-1">
                  Select Admin
                </label>
                <select
                  id="admin"
                  value={selectedAdminId || ""}
                  onChange={(e) => setSelectedAdminId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 hover:bg-blue-600"
            >
              Create User
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 bg-gray-500 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog.Panel>
    </Dialog>
  </Transition>
  
  );
};

export default CreateUserModal;
