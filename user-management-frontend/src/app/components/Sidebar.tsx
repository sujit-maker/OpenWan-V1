"use client"
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  Person,
  LocationOn,
  Devices,
  Menu as MenuIcon,
  Domain,
} from "@mui/icons-material";
import { drawerWidth, drawerCollapsedWidth } from "./constants";
import { useAuth } from "../hooks/useAuth";

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  width: open ? drawerWidth : drawerCollapsedWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  backgroundColor: "rgb(31, 41, 55)",
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : drawerCollapsedWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    backgroundColor: "rgb(31, 41, 55)",
  },
}));

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUserType } = useAuth();
  const router = useRouter();
  const currentPath = usePathname();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const getManageUsersLink = () => {
    if (!currentUserType) return "";

    switch (currentUserType) {
      case "ADMIN":
        return "/admin";
      case "MANAGER":
        return "/manager";
      case "SUPERADMIN":
        return "/super";
      case "EXECUTIVE":
        return "/executive";
      default:
        return "/";
    }
  };

  const handleNavigation = (path: string) => {
    if (currentPath === path) return;

    setLoading(true);
    router.push(path);
  };

  return (
    <div>
      <Drawer variant="permanent" open={open}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: theme.spacing(2.5),
          }}
        >
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            <MenuIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItemButton onClick={() => handleNavigation("/dashboard")}>
            <ListItemIcon sx={{ color: "white" }}>
              <Dashboard />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              sx={{ display: open ? "block" : "none", color: "white" }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => handleNavigation(getManageUsersLink())}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <Person />
            </ListItemIcon>
            <ListItemText
              primary="Manage Users"
              sx={{ display: open ? "block" : "none", color: "white" }}
            />
          </ListItemButton>

          <ListItemButton onClick={() => handleNavigation("/customer")}>
            <ListItemIcon sx={{ color: "white" }}>
              <Domain />
            </ListItemIcon>
            <ListItemText
              primary="Customer"
              sx={{ display: open ? "block" : "none", color: "white" }}
            />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation("/site")}>
            <ListItemIcon sx={{ color: "white" }}>
              <LocationOn />
            </ListItemIcon>
            <ListItemText
              primary="Site"
              sx={{ display: open ? "block" : "none", color: "white" }}
            />
          </ListItemButton>
          <ListItemButton onClick={() => handleNavigation("/device")}>
            <ListItemIcon sx={{ color: "white" }}>
              <Devices />
            </ListItemIcon>
            <ListItemText
              primary="Devices"
              sx={{ display: open ? "block" : "none", color: "white" }}
            />
          </ListItemButton>
        </List>
      </Drawer>

      {loading && (
        <div
          role="status"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <svg
            aria-hidden="true"
            className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
