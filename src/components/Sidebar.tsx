import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Brain, 
  FileImage, 
  Home, 
  Settings, 
  Users, 
  Menu,
  BarChart3,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
    icon: User,
    name: "Meu Perfil",
    path: "/perfil"
  },
  { 
    icon: Settings, 
    name: "Configurações", 
    path: "/configuracoes" 
  },
];

interface MedicoInfo {
  SG_UF: string;
  NU_CRM: string;
  NM_MEDICO: string;
  DT_INSCRICAO: string;
  SITUACAO: string;
  ESPECIALIDADE: string;
}

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  darkMode: boolean;
  userInfo?: MedicoInfo | null;
}

const Sidebar = ({ isMobileOpen, toggleMobileSidebar, darkMode, userInfo }: SidebarProps) => {
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

  // Get first name only for display
  const displayName = userInfo?.NM_MEDICO 
    ? userInfo.NM_MEDICO.split(' ')[0] 
    : "Médico";

  // Get specialty or default
  const displaySpecialty = userInfo?.ESPECIALIDADE || "Profissional de Saúde";

  // Get initials for avatar
  const getInitials = () => {
    if (!userInfo?.NM_MEDICO) return "M";
    
    const nameParts = userInfo.NM_MEDICO.split(' ');
    if (nameParts.length === 1) return nameParts[0][0];
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
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

      {/* Rodapé com informações do usuário */}
      <div className={cn(
        "p-4 border-t",
        darkMode ? "border-gray-700" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold",
            darkMode ? "bg-blue-700" : "bg-blue-600"
          )}>
            {getInitials()}
          </div>
          <div className="text-sm overflow-hidden">
            <p className="font-medium truncate">{displayName}</p>
            <div className="flex items-center gap-1">
              <p className={cn(
                "text-xs truncate max-w-[120px]",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                {displaySpecialty}
              </p>
              {userInfo && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  darkMode ? "bg-green-800/50 text-green-200" : "bg-green-100 text-green-800"
                )}>
                  {userInfo.SG_UF}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
