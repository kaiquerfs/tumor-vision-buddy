
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Lock, MapPin, User, Loader2 } from "lucide-react";

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [crm, setCrm] = useState("");
  const [uf, setUf] = useState("");
  const [formErrors, setFormErrors] = useState({ crm: "", uf: "" });

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const validateForm = (): boolean => {
    const errors = { crm: "", uf: "" };
    let isValid = true;

    if (!crm.trim()) {
      errors.crm = "CRM é obrigatório";
      isValid = false;
    }

    if (!uf.trim()) {
      errors.uf = "UF é obrigatório";
      isValid = false;
    } else if (uf.length !== 2) {
      errors.uf = "UF deve ter 2 caracteres";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await login(crm, uf);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">TumorVision Buddy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Entre com suas credenciais para acessar a plataforma
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crm">CRM</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <User size={16} />
                </span>
                <Input
                  id="crm"
                  placeholder="Digite seu CRM"
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  className={`pl-10 ${formErrors.crm ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.crm && (
                <p className="text-sm text-red-500">{formErrors.crm}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <MapPin size={16} />
                </span>
                <Input
                  id="uf"
                  placeholder="UF (ex: SP)"
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  maxLength={2}
                  className={`pl-10 uppercase ${formErrors.uf ? 'border-red-500' : ''}`}
                />
              </div>
              {formErrors.uf && (
                <p className="text-sm text-red-500">{formErrors.uf}</p>
              )}
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Entrando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> 
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500 border-t p-4">
          © 2025 TumorVision - Plataforma de Diagnóstico
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
