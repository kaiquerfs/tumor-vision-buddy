// Layout.tsx
import { useState } from "react";
import Sidebar from "./Sidebar.tsx";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // ou puxar isso de contexto

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  return (
    <div className="flex">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        toggleMobileSidebar={toggleMobileSidebar} 
        darkMode={darkMode}
      />
      <main className="flex-1 ml-0 md:ml-64">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
