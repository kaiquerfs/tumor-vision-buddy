
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface MedicoInfo {
  SG_UF: string;
  NU_CRM: string;
  NM_MEDICO: string;
  DT_INSCRICAO: string;
  SITUACAO: string;
  ESPECIALIDADE: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: MedicoInfo | null;
  login: (crm: string, uf: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MedicoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (crm: string, uf: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ crm, uf }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.mensagem || "Erro ao fazer login");
        return false;
      }
      
      // Success
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.medico));
      
      setUser(data.medico);
      setIsAuthenticated(true);
      toast.success("Login realizado com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao conectar com o servidor");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Logout realizado com sucesso");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
