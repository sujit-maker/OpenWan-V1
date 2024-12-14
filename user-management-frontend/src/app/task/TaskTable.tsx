"use client";;
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import Header from "../components/Header";
import { Task } from "./types";

  const TaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setFilteredTasks(
      tasks.filter(
        (task) =>
          task.customer?.customerName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          task.site?.siteName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          task.service?.serviceName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, tasks]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:8000/tasks");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`http://localhost:8000/tasks/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        fetchTasks();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskCreated = () => {
    fetchTasks();
    setIsCreateModalOpen(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setIsEditModalOpen(false);
  };

  return (
    <div
    className="container mx-auto px-8 py-6 lg:pl-72"
    style={{ marginTop: 80 }}
    >
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition mb-4 md:mb-0"
          >
          Add Task
        </button>
        <div className="relative mt-4 md:mt-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="pl-8 pr-2 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
          />
          <FaSearch
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            size={20}
          />
        </div>
      </div>
      <div className="overflow-x-auto lg:overflow-hidden lg:-ml-10 ml-14">
  <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg lg:ml-0">
          {" "}
          <thead className="bg-gray-400">
            <tr>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Site</th>
              <th className="border p-2">Service</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Service</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Remark</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td className="border p-2 text-center">{task.customer?.customerName}</td>
                <td className="border p-2 text-center">{task.site?.siteName}</td>
                <td className="border p-2 text-center">{task.service?.serviceName}</td>
                <td className="border p-2 text-center">{task.description}</td>
                <td className="border p-2 text-center">{task.serviceType}</td>
                <td className="border p-2 text-center">
                  {new Date(task.date).toLocaleDateString()}
                </td>
                <td className="border p-2">{task.remark}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
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
      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          isOpen={isEditModalOpen}
          onTaskUpdated={handleTaskUpdated}
          closeModal={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TaskTable;
