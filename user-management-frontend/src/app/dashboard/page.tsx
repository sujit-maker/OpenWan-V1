"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar'; // Sidebar remains
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';

const Dashboard: React.FC = () => {
  const { userId, managerId, adminId, superadminId } = useAuth(); // Get userId, managerId, adminId, and superadminId
  const [userCount, setUserCount] = useState<number | null>(null);
  const [adminUserCount, setAdminUserCount] = useState<number | null>(null);
  const [executiveCount, setExecutiveCount] = useState<number | null>(null); // New state for executive count

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        // If superadmin is logged in, fetch all counts
        if (superadminId) {
          // Fetch all counts for superadmin
          const allCountsResponse = await fetch(`http://40.0.0.109:8000/users/counts`);
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
          const response = await fetch(`http://40.0.0.109:8000/users/count/manager/${managerId}`);
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
          const adminResponse = await fetch(`http://40.0.0.109:8000/users/count/admin/${adminId}`);
          const adminData = await adminResponse.json();
          if (typeof adminData === 'number') {
            setAdminUserCount(adminData);
          } else {
            console.error('Invalid data format for admin user count:', adminData);
          }

          // Fetch executives associated with adminId
          const executiveResponse = await fetch(`http://40.0.0.109:8000/users/count/executives/admin/${adminId}`);
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
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        {/* Show all counts if superadmin */}
        {superadminId && (
          <>
          {adminUserCount !== null && (
              <div className="mt-6 w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Admin Count</h3>
                <p className="text-3xl font-bold text-gray-800 text-center">{adminUserCount}</p>
              </div>
            )}
            {userCount !== null && (
              <div className="mt-6 w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Managers Count</h3>
                <p className="text-3xl font-bold text-gray-800 text-center">{userCount}</p>
              </div>
            )}
            
            {executiveCount !== null && (
              <div className="mt-6 w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Executives Count</h3>
                <p className="text-3xl font-bold text-gray-800 text-center">{executiveCount}</p>
              </div>
            )}
          </>
        )}

        {/* Existing logic for managers and admins */}
        {!superadminId && (
          <>
            {userCount !== null && (
              <div className="mt-6 w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Executive Count</h3>
                <p className="text-3xl font-bold text-gray-800 text-center">{userCount}</p>
              </div>
            )}
            {adminUserCount !== null && (
              <div className="mt-6 w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Managers Count</h3>
                <p className="text-3xl font-bold text-gray-800 text-center">{adminUserCount}</p>
              </div>
            )}
            {executiveCount !== null && (
              <div className="mt-6 w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Executives Count</h3>
                <p className="text-3xl font-bold text-gray-800 text-center">{executiveCount}</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
