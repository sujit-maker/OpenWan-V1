"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar'; 
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';

const Dashboard: React.FC = () => {
  const {managerId, adminId, superadminId } = useAuth(); 
  const [userCount, setUserCount] = useState<number | null>(null);
  const [adminUserCount, setAdminUserCount] = useState<number | null>(null);
  const [executiveCount, setExecutiveCount] = useState<number | null>(null); 

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        // If superadmin is logged in, fetch all counts
        if (superadminId) {
          // Fetch all counts for superadmin
          const allCountsResponse = await fetch(`http://localhost:8000/users/counts`);
          const allCountsData = await allCountsResponse.json();
          
          if (allCountsData && 
              typeof allCountsData.executives === 'number' && 
              typeof allCountsData.managers === 'number' && 
              typeof allCountsData.admins === 'number') {
            setUserCount(allCountsData.managers);
            setAdminUserCount(allCountsData.admins);
            setExecutiveCount(allCountsData.executives);
          } else {
            console.error('Invalid data format for all counts:', allCountsData);
          }
        }

        // Fetch managers count if managerId is present
        if (managerId) {
          const response = await fetch(`http://localhost:8000/users/count/manager/${managerId}`);
          const data = await response.json();
          if (typeof data === 'number') {
            setUserCount(data);
          } else {
            console.error('Invalid data format for manager count:', data);
          }
        }

        // Fetch admin count and executive count if adminId is present
        if (adminId) {
          // Fetch managers associated with adminId
          const adminResponse = await fetch(`http://localhost:8000/users/count/admin/${adminId}`);
          const adminData = await adminResponse.json();
          if (typeof adminData === 'number') {
            setAdminUserCount(adminData);
          } else {
            console.error('Invalid data format for admin user count:', adminData);
          }

          // Fetch executives associated with adminId
          const executiveResponse = await fetch(`http://localhost:8000/users/count/executives/admin/${adminId}`);
          const executiveData = await executiveResponse.json();
          if (typeof executiveData === 'number') {
            setExecutiveCount(executiveData);
          } else {
            console.error('Invalid data format for executive count:', executiveData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user counts:', error);
      }
    };
    
    fetchUserCounts();
  }, [managerId, adminId, superadminId]); 
  return (
<>
  <Header />
  <Sidebar />
  <div className="my-28 px-4">
    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 ">Dashboard</h1>

    <div className="flex flex-col items-center space-y-6 md:space-y-0 md:flex-row md:flex-wrap justify-center md:space-x-6">
      {/* Show all counts if superadmin */}
      {superadminId ? (
        <>
          {adminUserCount !== null && (
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Admins Count</h3>
              <p className="text-4xl font-bold text-gray-800 text-center mt-2">{adminUserCount}</p>
            </div>
          )}
          {userCount !== null && (
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Managers Count</h3>
              <p className="text-4xl font-bold text-gray-800 text-center mt-2">{userCount}</p>
            </div>
          )}
          {executiveCount !== null && (
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Executives Count</h3>
              <p className="text-4xl font-bold text-gray-800 text-center mt-2">{executiveCount}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {userCount !== null && (
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Executive Count</h3>
              <p className="text-4xl font-bold text-gray-800 text-center mt-2">{userCount}</p>
            </div>
          )}
          {adminUserCount !== null && (
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Managers Count</h3>
              <p className="text-4xl font-bold text-gray-800 text-center mt-2">{adminUserCount}</p>
            </div>
          )}
          {executiveCount !== null && (
            <div className="w-full max-w-[300px] bg-white rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 text-center">Executives Count</h3>
              <p className="text-4xl font-bold text-gray-800 text-center mt-2">{executiveCount}</p>
            </div>
          )}
        </>
      )}
    </div>
  </div>
</>


  );
};

export default Dashboard;
