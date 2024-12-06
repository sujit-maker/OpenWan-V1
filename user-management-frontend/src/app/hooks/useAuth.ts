 "use client";
 import { useState, useEffect } from "react";
 import { useRouter } from "next/navigation";
 import { loginUser, changeUserPassword } from "../authservice/authService";
 import { toast } from "react-toastify";

 type UserType = "ADMIN" | "EXECUTIVE" | "MANAGER" | "SUPERADMIN";

 interface LoginResponse {
  access_token: string;
  id: string;
  usertype: UserType;
  username: string; 
 }

  export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [superadminId, setSuperadminId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null); 

  const router = useRouter();

  // Utility function to set and get items from localStorage
  const setLocalStorage = (key: string, value: string | null) => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  };

  const getLocalStorage = (key: string) => {
    return localStorage.getItem(key);
  };

  // Fetch IDs, userType, and username from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(getLocalStorage("userId"));
      setManagerId(getLocalStorage("managerId"));
      setAdminId(getLocalStorage("adminId"));
      setSuperadminId(getLocalStorage("superadminId"));
      const userType = getLocalStorage("userType");
      const storedUsername = getLocalStorage("username"); // Fetch username from localStorage
      if (userType) {
        setCurrentUserType(userType as UserType);
      }
      if (storedUsername) {
        setUsername(storedUsername); // Set username in state
      }
    }
  }, []);

  // Login function
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { access_token, id, usertype, username: fetchedUsername }: LoginResponse = await loginUser(
        username,
        password
      );
      setCurrentUserType(usertype);
      setUserId(id);
      setUsername(fetchedUsername); // Set username on successful login

      if (usertype === "MANAGER") {
        setManagerId(id);
      } else if (usertype === "ADMIN") {
        setAdminId(id);
      } else if (usertype === "SUPERADMIN") {
        setSuperadminId(id);
      }

      setLocalStorage("access_token", access_token);
      setLocalStorage("userId", id);
      setLocalStorage("userType", usertype);
      setLocalStorage("username", fetchedUsername); // Save username in localStorage
      setLocalStorage("managerId", usertype === "MANAGER" ? id : null);
      setLocalStorage("adminId", usertype === "ADMIN" ? id : null);
      setLocalStorage("superadminId", usertype === "SUPERADMIN" ? id : null);

      // Display success toast
      toast.success("Login successful!");

      // Delay for 1 second to allow the toast message to be visible
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect based on the user type
      switch (usertype) {
        case "ADMIN":
          router.push("/dashboard");
          break;
        case "EXECUTIVE":
          router.push("/executive");
          break;
        case "MANAGER":
          router.push("/dashboard");
          break;
        case "SUPERADMIN":
          router.push("/dashboard");
          break;
        default:
          throw new Error("Invalid usertype");
      }
      return true;
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed. Please try again.");
      return false; // Login failed
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUserType(null);
    setUserId(null);
    setManagerId(null);
    setAdminId(null);
    setSuperadminId(null);
    setUsername(null); // Clear username
    setLocalStorage("access_token", null);
    setLocalStorage("userId", null);
    setLocalStorage("userType", null);
    setLocalStorage("managerId", null);
    setLocalStorage("adminId", null);
    setLocalStorage("superadminId", null);
    setLocalStorage("username", null); 
    router.push("/");
  };

  // Change Password function
  const changePassword = async (
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userId = getLocalStorage("userId");
      if (!userId) throw new Error("User not authenticated.");

      await changeUserPassword(userId, newPassword, confirmPassword);
      alert("Password changed successfully.");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Failed to change password.");
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
    currentUserType,
    logout,
    userId,
    managerId,
    adminId,
    superadminId,
    username, 
    changePassword,
  };
};
