
import { BarChart3 } from "lucide-react";

const Estatisticas = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <BarChart3 className="w-16 h-16 mb-4 text-blue-500" />
      <h1 className="text-2xl font-bold mb-2">Estatísticas</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Esta funcionalidade estará disponível em breve. Aqui você poderá visualizar estatísticas e métricas sobre as análises realizadas.
      </p>
    </div>
  );
};

export default Estatisticas;
