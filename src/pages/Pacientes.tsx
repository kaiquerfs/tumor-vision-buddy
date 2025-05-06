import { useHistory, AnalysisEntry } from "@/contexts/HistoryContext";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnalysisHistoryTable } from "@/components/AnalysisHistoryTable";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

const Pacientes = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <Users className="w-16 h-16 mb-4 text-blue-500" />
      <h1 className="text-2xl font-bold mb-2">Gerenciamento de Pacientes</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Esta funcionalidade estará disponível em breve. Aqui você poderá gerenciar os dados dos seus pacientes.
      </p>
    </div>
  );
};

export default Pacientes;
