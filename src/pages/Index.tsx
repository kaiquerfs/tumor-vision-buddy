import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useHistory } from "@/contexts/HistoryContext";
import { usePatient } from "@/contexts/PatientContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ImageIcon,
  Plus,
  Brain,
  FileImage,
  UserPlus,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Index = ({ darkMode }: { darkMode: boolean }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addHistory } = useHistory();
  const { addPatient } = usePatient();
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientId, setNewPatientId] = useState("");
  const { user } = useAuth();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setSelectedImage(URL.createObjectURL(file));
    },
  });

  const handleClassSelect = (value: string) => {
    setSelectedClass(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage || !patientName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    // Form processing logic here
    console.log("Imagem selecionada:", selectedImage);
    console.log("Nome do paciente:", patientName);
    console.log("ID do paciente:", patientId);
    console.log("Anotações:", notes);
    console.log("Classe selecionada:", selectedClass);
    
    // Save to history
    addHistory({
      imageUrl: selectedImage,
      patientName: patientName,
      patientId: patientId,
      detections: [{
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200,
        label: `Exemplo: ${selectedClass || 'Tumor não classificado'} (100%)`
      }],
      notes: notes,
      doctorInfo: user ? {
        name: user.NM_MEDICO,
        crm: user.NU_CRM,
        uf: user.SG_UF
      } : undefined
    });
    
    // Reset form
    setSelectedImage(null);
    setPatientName("");
    setPatientId("");
    setNotes("");
    setSelectedClass(null);
    
    toast.success("Análise adicionada ao histórico!");
    navigate("/historico");
  };

  const openNewPatientModal = () => {
    setIsNewPatientModalOpen(true);
  };

  const closeNewPatientModal = () => {
    setIsNewPatientModalOpen(false);
    setNewPatientName("");
    setNewPatientId("");
  };

  const handleCreateNewPatient = () => {
    if (!newPatientName || !newPatientId) {
      toast.error("Nome e ID do paciente são obrigatórios");
      return;
    }

    addPatient({
      id: newPatientId,
      name: newPatientName,
    });

    toast.success("Paciente adicionado com sucesso!");
    closeNewPatientModal();
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Análise Rápida de Imagem</CardTitle>
          <CardDescription>
            Selecione uma imagem e insira os detalhes do paciente para iniciar
            a análise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload de Imagem */}
            <div {...getRootProps()} className={cn(
              "border-2 border-dashed rounded-md p-4 text-center cursor-pointer",
              selectedImage ? "bg-gray-100" : "bg-transparent",
              darkMode ? "border-gray-700" : "border-gray-300"
            )}>
              <input {...getInputProps()} />
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Imagem selecionada"
                  className="max-h-48 mx-auto rounded-md"
                />
              ) : (
                <>
                  <ImageIcon className="mx-auto h-6 w-6 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Arraste e solte a imagem aqui ou clique para selecionar
                  </p>
                </>
              )}
            </div>

            {/* Nome do Paciente */}
            <div>
              <Label htmlFor="patientName">Nome do Paciente</Label>
              <div className="relative">
                <Input
                  type="text"
                  id="patientName"
                  placeholder="Digite o nome do paciente"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={openNewPatientModal}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ID do Paciente */}
            <div>
              <Label htmlFor="patientId">ID do Paciente (opcional)</Label>
              <Input
                type="text"
                id="patientId"
                placeholder="Digite o ID do paciente"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>

            {/* Anotações */}
            <div>
              <Label htmlFor="notes">Anotações</Label>
              <Textarea
                id="notes"
                placeholder="Adicione anotações sobre a imagem"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Classificação */}
            <div>
              <Label htmlFor="class">Classificação (exemplo)</Label>
              <Select onValueChange={handleClassSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Glioblastoma">Glioblastoma</SelectItem>
                  <SelectItem value="Meningioma">Meningioma</SelectItem>
                  <SelectItem value="Metástase">Metástase</SelectItem>
                  <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão de Envio */}
            <Button type="submit" className="w-full">
              Analisar Imagem
              <Brain className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Modal para Novo Paciente */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Novo Paciente</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPatientName">Nome do Paciente</Label>
                <Input
                  type="text"
                  id="newPatientName"
                  placeholder="Digite o nome do paciente"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newPatientId">ID do Paciente</Label>
                <Input
                  type="text"
                  id="newPatientId"
                  placeholder="Digite o ID do paciente"
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={closeNewPatientModal}>
                Cancelar
              </Button>
              <Button onClick={handleCreateNewPatient}>Criar Paciente</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
