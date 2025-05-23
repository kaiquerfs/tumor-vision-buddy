
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Analise from "./pages/Analise";
import Historico from "./pages/Historico";
import Pacientes from "./pages/Pacientes";
import Estatisticas from "./pages/Estatisticas";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";

import Sidebar from "@/components/Sidebar";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import { HistoryProvider } from "./contexts/HistoryContext";
import { PatientProvider } from "./contexts/PatientContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout, user } = useAuth();
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
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } min-h-screen flex transition-all duration-300`}
    >
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
        darkMode={darkMode}
        userInfo={user}
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className={`rounded-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
              title={darkMode ? "Modo claro" : "Modo escuro"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className={`rounded-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
              title="Sair"
            >
              <LogOut className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PatientProvider>
          <HistoryProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate to="/analise" />} />
                  <Route path="/analise" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Analise />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/historico" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Historico />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/pacientes" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Pacientes />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/estatisticas" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Estatisticas />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracoes" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Configuracoes />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <UserProfile />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </HistoryProvider>
        </PatientProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
