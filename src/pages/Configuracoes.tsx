
import { Settings } from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <Settings className="w-16 h-16 mb-4 text-blue-500" />
      <h1 className="text-2xl font-bold mb-2">Configurações</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Esta funcionalidade estará disponível em breve. Aqui você poderá ajustar as configurações do sistema.
      </p>
    </div>
  );
};

export default Configuracoes;
