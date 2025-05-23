// src/pages/Pacientes.tsx
import { useState, useEffect } from "react";
import { Users, PlusCircle, Pencil, Trash2, Brain, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHistory } from "@/contexts/HistoryContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import PatientAnalysesList from "@/components/PatientAnalysesList";

interface Paciente {
  id: string;
  nome: string;
  idade: string;
  genero: string;
  prontuario: string;
}

const Pacientes = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [novoPaciente, setNovoPaciente] = useState<Omit<Paciente, "id">>({
    nome: "",
    idade: "",
    genero: "",
    prontuario: "",
  });
  const { history } = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pacientes");

  // Carregar pacientes do localStorage quando o componente for montado
  useEffect(() => {
    const savedPacientes = localStorage.getItem("pacientes");
    if (savedPacientes) {
      setPacientes(JSON.parse(savedPacientes));
    }
  }, []);

  // Salvar pacientes no localStorage sempre que houver alteração
  useEffect(() => {
    localStorage.setItem("pacientes", JSON.stringify(pacientes));
  }, [pacientes]);

  const handleAddOrUpdatePaciente = () => {
    // Validação dos campos
    if (!novoPaciente.nome || novoPaciente.nome.trim().length < 3) {
      setFormError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    const idade = Number(novoPaciente.idade);
    if (!novoPaciente.idade || idade <= 0 || idade > 130 || isNaN(idade)) {
      setFormError("A idade deve ser um número entre 1 e 130.");
      return;
    }

    if (!novoPaciente.genero) {
      setFormError("O gênero não pode estar em branco.");
      return;
    }

    if (!novoPaciente.prontuario || novoPaciente.prontuario.trim() === "") {
      setFormError("O prontuário não pode estar em branco.");
      return;
    }

    const pacienteComId = {
      id: editingId ?? uuidv4(), // Se editando, mantém o ID existente; se criando, gera um novo UUID
      ...novoPaciente,
    };

    // Se estiver editando, substitui o paciente com o mesmo ID
    if (editingId !== null) {
      setPacientes((prev) =>
        prev.map((p) => (p.id === editingId ? pacienteComId : p))
      );
      toast.success("Paciente atualizado com sucesso");
    } else {
      setPacientes((prev) => [...prev, pacienteComId]);
      toast.success("Paciente cadastrado com sucesso");
    }

    setNovoPaciente({ nome: "", idade: "", genero: "", prontuario: "" });
    setEditingId(null);
    setIsOpen(false);
    setFormError("");  // Limpar erro ao enviar
  };

  const handleEdit = (paciente: Paciente) => {
    setNovoPaciente({
      nome: paciente.nome,
      idade: paciente.idade,
      genero: paciente.genero,
      prontuario: paciente.prontuario,
    });
    setEditingId(paciente.id);
    setIsOpen(true);
  };

  const handleRemove = (id: string) => {
    setPacientes((prev) => prev.filter((p) => p.id !== id));
    toast.success("Paciente removido com sucesso");
  };

  const viewPatientAnalyses = (patientId: string) => {
    setSelectedPatient(patientId);
    setActiveTab("analises");
  };

  // Contagem de análises por paciente
  const getPatientAnalysesCount = (patientId: string) => {
    return history.filter(analysis => analysis.patientId === patientId).length;
  };

  const selectedPatientName = pacientes.find(p => p.id === selectedPatient)?.nome;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Pacientes
        </h1>
        <Button variant="default" size="sm" className="flex items-center gap-1" onClick={() => setIsOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="pacientes" onClick={() => setActiveTab("pacientes")}>
            <Users className="h-4 w-4 mr-2" /> Lista de Pacientes
          </TabsTrigger>
          <TabsTrigger 
            value="analises" 
            onClick={() => setActiveTab("analises")} 
            disabled={!selectedPatient}
          >
            <Brain className="h-4 w-4 mr-2" /> Análises do Paciente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes">
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Gênero</TableHead>
                    <TableHead>Prontuário</TableHead>
                    <TableHead>Análises</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <FileImage className="h-8 w-8 mb-2 text-muted-foreground/60" />
                          <p>Nenhum paciente cadastrado</p>
                          <Button 
                            variant="outline" 
                            className="mt-4" 
                            size="sm" 
                            onClick={() => setIsOpen(true)}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Cadastrar paciente
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pacientes.map((paciente) => (
                      <TableRow key={paciente.id} className="hover:bg-muted/50 cursor-pointer">
                        <TableCell className="font-medium">{paciente.nome}</TableCell>
                        <TableCell>{paciente.idade}</TableCell>
                        <TableCell>{paciente.genero}</TableCell>
                        <TableCell>{paciente.prontuario}</TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            onClick={() => viewPatientAnalyses(paciente.id)}
                            className="p-0 h-auto underline text-blue-600 hover:text-blue-800"
                          >
                            {getPatientAnalysesCount(paciente.id)} análise(s)
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(paciente)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemove(paciente.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analises">
          {selectedPatient && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Análises de {selectedPatientName}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab("pacientes")}
                >
                  Voltar para lista
                </Button>
              </div>
              <PatientAnalysesList patientId={selectedPatient} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId !== null ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="nome" className="text-sm font-medium">Nome</label>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={novoPaciente.nome}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, nome: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="idade" className="text-sm font-medium">Idade</label>
              <Input
                id="idade"
                type="number"
                placeholder="Idade"
                value={novoPaciente.idade}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, idade: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="genero" className="text-sm font-medium">Gênero</label>
              <select
                id="genero"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={novoPaciente.genero}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, genero: e.target.value })}
              >
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="prontuario" className="text-sm font-medium">Prontuário</label>
              <Input
                id="prontuario"
                placeholder="Número do prontuário"
                value={novoPaciente.prontuario}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, prontuario: e.target.value })}
              />
            </div>
          </div>

          {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsOpen(false);
              setFormError("");
              setNovoPaciente({ nome: "", idade: "", genero: "", prontuario: "" });
              setEditingId(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddOrUpdatePaciente}>
              {editingId !== null ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pacientes;
