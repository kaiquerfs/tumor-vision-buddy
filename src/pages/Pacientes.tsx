
import { Users } from "lucide-react";

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
