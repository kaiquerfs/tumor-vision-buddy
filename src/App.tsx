import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Index from "./pages/Index";
import Analise from "./pages/Analise";
import Historico from "./pages/Historico";
import Pacientes from "./pages/Pacientes";
import Estatisticas from "./pages/Estatisticas";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

import Sidebar from "@/components/Sidebar";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { HistoryProvider } from "./contexts/HistoryContext";
import { PatientProvider } from "./contexts/PatientContext";

const queryClient = new QueryClient();

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", String(newMode));
      return newMode;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const SidebarOverlay = () => (
    <div
      className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isMobileSidebarOpen ? "block" : "hidden"}`}
      onClick={toggleMobileSidebar}
    />
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PatientProvider>
        <HistoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div
                className={`${
                  darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
                } min-h-screen flex transition-all duration-300`}
              >
                <Sidebar
                  isMobileOpen={isMobileSidebarOpen}
                  toggleMobileSidebar={toggleMobileSidebar}
                  darkMode={darkMode}
                />
                <SidebarOverlay />

                <div className="flex-1 md:ml-64 p-4 md:p-6">
                  <div className="w-full flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleMobileSidebar}
                        className={`md:hidden rounded-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleDarkMode}
                      className={`rounded-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
                    >
                      {darkMode ? (
                        <Sun className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  <Routes>
                    <Route path="/" element={<Index darkMode={darkMode} />} />
                    <Route path="/analise" element={<Analise />} />
                    <Route path="/historico" element={<Historico />} />
                    <Route path="/pacientes" element={<Pacientes />} />
                    <Route path="/estatisticas" element={<Estatisticas />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </HistoryProvider>
      </PatientProvider>
    </QueryClientProvider>
  );
};

export default App;
