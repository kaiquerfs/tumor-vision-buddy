
import { Brain } from "lucide-react";

const Historico = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <Brain className="w-16 h-16 mb-4 text-blue-500" />
      <h1 className="text-2xl font-bold mb-2">Histórico de Imagens</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Esta funcionalidade estará disponível em breve. Aqui você poderá ver o histórico de todas as imagens analisadas.
      </p>
    </div>
  );
};

export default Historico;
