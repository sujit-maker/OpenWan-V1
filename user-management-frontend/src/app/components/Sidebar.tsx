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
import { FaSpinner } from "react-icons/fa";

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
          <span className="sr-only">Loading...</span>
          <div className="flex justify-center items-center">
              <FaSpinner className="animate-spin text-blue-800 text-9xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
