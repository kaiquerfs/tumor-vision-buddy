
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  User,
  Calendar,
  MapPin,
  Award,
  Clipboard,
  Shield,
  BadgeCheck
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatisticsCard } from "@/components/StatisticsCard";
import { useHistory } from "@/contexts/HistoryContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { history } = useHistory();
  const navigate = useNavigate();

  // If not logged in or no user data, redirect to login
  if (!user) {
    navigate("/login");
    return null;
  }

  // Process the situation status - show "Regular" as "Ativo"
  const situationStatus = user.SITUACAO === "Regular" ? "Ativo" : user.SITUACAO;
  const isActive = situationStatus === "Ativo";

  const formatDate = (dateString: string) => {
    try {
      // Parse date from DD/MM/YYYY format
      const parts = dateString.split("/");
      if (parts.length !== 3) return dateString;
      
      const date = new Date(
        parseInt(parts[2]), 
        parseInt(parts[1]) - 1, 
        parseInt(parts[0])
      );
      
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  // Count statistics
  const analysisCount = history.length;
  const patientData = JSON.parse(localStorage.getItem("pacientes") || "[]");
  const patientCount = patientData.length;

  // Get unique tumor types from all diagnoses
  const tumorTypes = new Set<string>();
  history.forEach(item => {
    item.detections.forEach(detection => {
      const tumorType = detection.label.split(":")[1]?.trim();
      if (tumorType) tumorTypes.add(tumorType);
    });
  });
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="h-6 w-6" />
        Meu Perfil
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Informações do Médico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.NM_MEDICO.split(' ').map(name => name[0]).join('').substring(0, 2)}
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold">{user.NM_MEDICO}</h2>
              <p className="text-sm text-muted-foreground">{user.ESPECIALIDADE}</p>
              
              <div className="flex justify-center items-center gap-1 mt-1">
                <span className={`bg-${isActive ? 'green' : 'red'}-100 text-${isActive ? 'green' : 'red'}-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-${isActive ? 'green' : 'red'}-900 dark:text-${isActive ? 'green' : 'red'}-200`}>
                  {situationStatus}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clipboard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">CRM</p>
                  <p className="text-sm text-muted-foreground">{user.NU_CRM}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">UF</p>
                  <p className="text-sm text-muted-foreground">{user.SG_UF}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data de Inscrição</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.DT_INSCRICAO)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Especialidade</p>
                  <p className="text-sm text-muted-foreground">{user.ESPECIALIDADE}</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={logout}
            >
              Sair da Plataforma
            </Button>
          </CardContent>
        </Card>
        
        {/* Statistics Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Estatísticas do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatisticsCard
                title="Total de Análises"
                value={analysisCount.toString()}
                description="Análises realizadas"
                icon={Clipboard}
                className="h-full"
                onClick={() => navigate('/historico')}
              />
              
              <StatisticsCard
                title="Total de Pacientes"
                value={patientCount.toString()}
                description="Pacientes cadastrados"
                icon={User}
                className="h-full"
                onClick={() => navigate('/pacientes')}
              />
              
              <StatisticsCard
                title="Tipos de Tumores"
                value={tumorTypes.size.toString()}
                description="Tipos de tumores detectados"
                icon={Award}
                className="h-full"
                iconClassName="bg-orange-500"
              />
              
              <StatisticsCard
                title="Situação do Registro"
                value={situationStatus}
                description="Status do seu registro médico"
                icon={Shield}
                className="h-full"
                iconClassName={isActive ? "bg-green-500" : "bg-red-500"}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
                Credenciais e Autorizações
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-muted rounded-md">
                  <div className="mr-4 bg-green-100 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Análise de Tumores</h4>
                    <p className="text-xs text-muted-foreground">Autorizado</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-muted rounded-md">
                  <div className="mr-4 bg-blue-100 p-2 rounded-full">
                    <Clipboard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Gerenciamento de Pacientes</h4>
                    <p className="text-xs text-muted-foreground">Autorizado</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
