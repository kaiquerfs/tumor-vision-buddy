
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Brain, 
  FileImage, 
  Home, 
  Settings, 
  Users, 
  Menu,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { 
    icon: Home, 
    name: "Dashboard", 
    path: "/" 
  },
  { 
    icon: Brain, 
    name: "Análise de Tumores", 
    path: "/analise" 
  },
  { 
    icon: FileImage, 
    name: "Histórico de Imagens", 
    path: "/historico" 
  },
  { 
    icon: Users, 
    name: "Pacientes", 
    path: "/pacientes" 
  },
  { 
    icon: BarChart3, 
    name: "Estatísticas", 
    path: "/estatisticas" 
  },
  { 
    icon: Settings, 
    name: "Configurações", 
    path: "/configuracoes" 
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  darkMode: boolean;
}

const Sidebar = ({ isMobileOpen, toggleMobileSidebar, darkMode }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const handleNavigation = (path: string) => {
    setActiveItem(path);
    navigate(path);
    // Only close the sidebar on mobile devices
    if (window.innerWidth < 768) {
      toggleMobileSidebar();
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-300 ease-in-out border-r flex flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        darkMode 
          ? "bg-gray-800 border-gray-700 text-white" 
          : "bg-white border-gray-200 text-gray-900"
      )}
    >
      {/* Logo e Título */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        darkMode ? "border-gray-700" : "border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <Brain className={cn("h-8 w-8", darkMode ? "text-blue-400" : "text-blue-600")} />
          <h2 className="text-lg font-bold">TumorVision</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2 text-sm",
                  activeItem === item.path
                    ? darkMode
                      ? "bg-blue-900/40 text-blue-200"
                      : "bg-blue-100 text-blue-800"
                    : darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé */}
      <div className={cn(
        "p-4 border-t",
        darkMode ? "border-gray-700" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            N
          </div>
          <div className="text-sm">
            <p className="font-medium">Dr. Neurologista</p>
            <p className={cn(
              "text-xs",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>Médico</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
