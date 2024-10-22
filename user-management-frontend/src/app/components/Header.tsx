"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaLock } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { HiLogout } from "react-icons/hi";

const Header: React.FC = () => {
  const router = useRouter();
  const { changePassword, loading, error } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Add success message state

  const handleLogout = () => {
    router.push("/");
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
  
    try {
      await changePassword(newPassword, confirmPassword); 
      setIsModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setSuccessMessage("Password changed successfully!");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message || "Failed to change password");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };
  

  return (
    <>
      <header className="bg-gray-800 text-white p-4 fixed top-0 left-0 w-full z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-grow" />
          <FaLock
            size={20}
            className="text-white mr-4 cursor-pointer"
            onClick={() => setIsModalOpen(true)} 
            aria-label="Change Password"
          />
          <button
            onClick={handleLogout}
            className=" text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600 bg-red-500  transition-all"
            aria-label="Logout"
            style={{width:"90px",marginRight:"20px"}}
          >
            <HiLogout size={24} className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      {isModalOpen && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
            <h2 className="text-xl font-bold mb-4 text-center">Change Password</h2>
            {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
            {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter new password"
                aria-label="New Password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Confirm new password"
                aria-label="Confirm Password"
              />
            </div>
            <div className="flex justify-center">
            <button
  onClick={handleChangePassword}
  disabled={loading} // Disable the button if loading
  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
>
  {loading ? "Loading..." : "Change Password"}
</button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all ml-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;