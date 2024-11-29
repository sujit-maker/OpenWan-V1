"use client";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

interface Manager {
  id: number;
  username: string;
}

interface User {
  id: number;
  username: string;
  usertype: string;
  managerId?: number;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
    fetchManagerId();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/users");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: User[] = await response.json();
      // Filter out users with the username 'admin'
      const filteredData = data.filter((user) => user.username !== "admin");
      setUsers(filteredData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchManagerId = async () => {
    try {
      const response = await fetch("http://localhost:8000/users/managers");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Manager[] = await response.json();
      setManagers(data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (username === "admin") {
      alert("SuperAdmin user cannot be deleted!");
      return;
    }

    // Confirm deletion with the user
    const confirmDelete = confirm(
      `Are you sure you want to delete user ${username}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
      });

      // Check for the response from the server
      if (!response.ok) {
        const errorMessage = await response.text();
        alert(`This User Has Associated User So You Cant Directly delete`);
        return;
      }
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    handleCloseEditModal();
  };

  const getManagerName = (managerId?: number) => {
    if (!managerId) return "N/A";
    const manager = managers.find((mgr) => mgr.id === managerId);
    return manager ? manager.username : "N/A";
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div
        className="container mx-auto px-8 py-6 lg:pl-72"
        style={{ marginTop: 80 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
          >
            Add User
          </button>
          <div className="relative mt-4 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-8 pr-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
            />
            <FaSearch
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={20}
            />
          </div>
        </div>
        <div className="overflow-x-auto lg:overflow-hidden lg:-ml-10 ml-14">
  <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg">
    <thead className="bg-gray-400">
      <tr>
        <th className="border p-1">Username</th>
        <th className="border p-1">User Type</th>
        <th className="border p-1">Manager Name</th>
        <th className="border p-1">Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentUsers.map((user) => (
        <tr key={user.id}>
          <td className="border p-1 text-center">{user.username}</td>
          <td className="border p-1 text-center">{user.usertype}</td>
          <td className="border p-1 text-center">
            {user.usertype === "EXECUTIVE"
              ? getManagerName(user.managerId)
              : "N/A"}
          </td>
          <td className="border p-1 text-center">
            <button
              onClick={() => handleEdit(user)}
              className="text-blue-500 hover:text-blue-700 mr-2"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(user.id, user.username)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        {/* Pagination controls */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded-md ${
              currentPage === 1
                ? "text-gray-400"
                : "text-blue-500 hover:bg-gray-200"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "text-blue-500 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 border rounded-md ${
              currentPage === totalPages
                ? "text-gray-400"
                : "text-blue-500 hover:bg-gray-200"
            }`}
          >
            Next
          </button>
        </div>

        {isCreateModalOpen && (
          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onUserCreated={fetchUsers}
            managers={managers}
          />
        )}
        {isEditModalOpen && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onUserUpdated={handleUserUpdated}
            closeModal={handleCloseEditModal}
            managers={managers}
          />
        )}
      </div>
    </>
  );
};

export default UserTable;
