// src/pages/Pacientes.tsx
import { useState, useEffect } from "react";
import { Users, PlusCircle, Pencil, Trash2 } from "lucide-react";
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
import { v4 as uuidv4 } from "uuid"; // Importando a função para gerar UUID

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
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");

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
    } else {
      setPacientes((prev) => [...prev, pacienteComId]);
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
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Pacientes
        </h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId !== null ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Nome"
                value={novoPaciente.nome}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, nome: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Idade"
                value={novoPaciente.idade}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, idade: e.target.value })}
              />
              <select
                className="border rounded px-3 py-2 text-sm"
                value={novoPaciente.genero}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, genero: e.target.value })}
              >
                <option value="">Selecione o gênero</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
              <Input
                placeholder="Prontuário"
                value={novoPaciente.prontuario}
                onChange={(e) => setNovoPaciente({ ...novoPaciente, prontuario: e.target.value })}
              />
            </div>

            {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}

            <DialogFooter>
              <Button onClick={handleAddOrUpdatePaciente}>
                {editingId !== null ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Prontuário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pacientes.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">{paciente.nome}</TableCell>
                  <TableCell>{paciente.idade}</TableCell>
                  <TableCell>{paciente.genero}</TableCell>
                  <TableCell>{paciente.prontuario}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pacientes.length === 0 && (
        <div className="text-center text-muted-foreground mt-6">
          Nenhum paciente cadastrado.
        </div>
      )}
    </div>
  );
};

export default Pacientes;
