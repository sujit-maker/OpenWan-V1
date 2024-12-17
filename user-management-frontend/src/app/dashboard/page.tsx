"use client";;
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";

  const Dashboard: React.FC = () => {
  const { managerId, adminId, superadminId } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [adminUserCount, setAdminUserCount] = useState<number | null>(null);
  const [executiveCount, setExecutiveCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        // If superadmin is logged in, fetch all counts
        if (superadminId) {
          // Fetch all counts for superadmin
          const allCountsResponse = await fetch(
            `http://122.169.108.252:8000/users/counts`
          );
          const allCountsData = await allCountsResponse.json();

          if (
            allCountsData &&
            typeof allCountsData.executives === "number" &&
            typeof allCountsData.managers === "number" &&
            typeof allCountsData.admins === "number"
          ) {
            setUserCount(allCountsData.managers);
            setAdminUserCount(allCountsData.admins);
            setExecutiveCount(allCountsData.executives);
          } else {
            console.error("Invalid data format for all counts:", allCountsData);
          }
        }

        // Fetch managers count if managerId is present
        if (managerId) {
          const response = await fetch(
            `http://122.169.108.252:8000/users/count/manager/${managerId}`
          );
          const data = await response.json();
          if (typeof data === "number") {
            setUserCount(data);
          } else {
            console.error("Invalid data format for manager count:", data);
          }
        }

        // Fetch admin count and executive count if adminId is present
        if (adminId) {
          // Fetch managers associated with adminId
          const adminResponse = await fetch(
            `http://122.169.108.252:8000/users/count/admin/${adminId}`
          );
          const adminData = await adminResponse.json();
          if (typeof adminData === "number") {
            setAdminUserCount(adminData);
          } else {
            console.error(
              "Invalid data format for admin user count:",
              adminData
            );
          }

          // Fetch executives associated with adminId
          const executiveResponse = await fetch(
            `http://122.169.108.252:8000/users/count/executives/admin/${adminId}`
          );
          const executiveData = await executiveResponse.json();
          if (typeof executiveData === "number") {
            setExecutiveCount(executiveData);
          } else {
            console.error(
              "Invalid data format for executive count:",
              executiveData
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch user counts:", error);
      }
    };

    fetchUserCounts();
  }, [managerId, adminId, superadminId]);

  return (
    <div className="flex  h-screen">

    <Sidebar />
  
    <div className="flex-1  flex flex-col">
      {/* Main Content */}
      <div className="my-28 px-2 mr-5">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Dashboard 
        </h1>
  
        <div className="flex flex-wrap justify-center md:justify-center gap-6">
          {superadminId ? (
            <>
              {adminUserCount !== null && (
                <div className="w-full sm:w-[300px] ml-[-24px] md:ml-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 p-6 flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-semibold text-center">
                    Admins Count
                  </h3>
                  <p className="text-4xl font-bold mt-2">{adminUserCount}</p>
                </div>
              )}
              {userCount !== null && (
                <div className="w-full sm:w-[300px] ml-[-24px] md:ml-0 bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-semibold text-center">
                    Managers Count
                  </h3>
                  <p className="text-4xl font-bold mt-2">{userCount}</p>
                </div>
              )}
              
            </>
          ) : (
            <>
             \
              {adminUserCount !== null && (
                <div className="w-full sm:w-[300px] ml-[-24px] md:ml-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white">
                  <h3 className="text-lg font-semibold text-center">
                    Managers Count
                  </h3>
                  <p className="text-4xl font-bold mt-2">{adminUserCount}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </div>
  
  );
};

export default Dashboard;

