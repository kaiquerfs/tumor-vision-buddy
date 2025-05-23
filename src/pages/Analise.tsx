import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHistory } from "@/contexts/HistoryContext";
import { usePatient } from "@/contexts/PatientContext";
import { Listbox, ListboxItem } from "@/components/ui/listbox";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Analise = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [detections, setDetections] = useState<
    { x1: number; y1: number; x2: number; y2: number; label: string }[]
  >([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { addHistory } = useHistory();
  const { patients } = usePatient();
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);

  // Get user info from auth context
  const { user } = useAuth();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);

        // Initialize Fabric.js canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 500,
          height: 400,
        });
        fabric.Image.fromURL(imageUrl, (img) => {
          img.scaleToWidth(500);
          img.scaleToHeight(400);
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height,
          });
        });
        canvasRef.current = canvas;
        setDetections([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async () => {
    if (!selectedImage) {
      toast.error("Selecione uma imagem primeiro");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate tumor detection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDetection = {
        x1: Math.floor(Math.random() * 400),
        y1: Math.floor(Math.random() * 300),
        x2: Math.floor(Math.random() * 100) + 400,
        y2: Math.floor(Math.random() * 100) + 300,
        label: `Tumor: ${selectedClass || "Não especificado"} (${Math.floor(
          Math.random() * 50 + 50
        )}%)`,
      };

      setDetections([newDetection]);

      // Draw rectangle on canvas
      if (canvasRef.current) {
        const rect = new fabric.Rect({
          left: newDetection.x1,
          top: newDetection.y1,
          width: newDetection.x2 - newDetection.x1,
          height: newDetection.y2 - newDetection.y1,
          fill: "transparent",
          stroke: "red",
          strokeWidth: 2,
        });
        canvasRef.current.add(rect);
      }

      toast.success("Tumores detectados com sucesso!");
    } catch (error) {
      console.error("Erro ao detectar tumores:", error);
      toast.error("Erro ao detectar tumores");
    } finally {
      setIsLoading(false);
    }

    // Save to history
    const newAnalysis = {
      imageUrl: selectedImage,
      patientId: selectedPatient?.id || undefined,
      patientName: selectedPatient?.name || "Paciente não selecionado",
      detections: detections || [],
      notes: notes,
      doctorInfo: user ? {
        name: user.NM_MEDICO,
        crm: user.NU_CRM,
        uf: user.SG_UF
      } : undefined
    };

    addHistory(newAnalysis);
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setSelectedImage(null);
      setDetections([]);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Análise de Imagens</h1>
        <p className="text-muted-foreground">
          Selecione uma imagem e o tipo de tumor para iniciar a análise.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Entrada de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image">Imagem</Label>
              <Input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                ref={imageInputRef}
                className="hidden"
              />
              <Button onClick={() => imageInputRef.current?.click()} className="w-full">
                {selectedImage ? "Trocar Imagem" : "Selecionar Imagem"}
              </Button>
              {selectedImage && (
                <Button variant="destructive" onClick={handleClearCanvas} className="w-full mt-2">
                  <X className="mr-2 h-4 w-4" />
                  Remover Imagem
                </Button>
              )}
            </div>

            <div>
              <Label htmlFor="patient">Paciente</Label>
              <Listbox onValueChange={(value) => {
                const patient = patients.find(p => p.id === value);
                setSelectedPatient(patient ? { id: patient.id, name: patient.name } : null);
              }}>
                <ListboxTrigger className="w-full">
                  {selectedPatient ? selectedPatient.name : "Selecionar Paciente"}
                </ListboxTrigger>
                <ListboxContent>
                  {patients.map((patient) => (
                    <ListboxItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </ListboxItem>
                  ))}
                </ListboxContent>
              </Listbox>
            </div>

            <div>
              <Label htmlFor="tumorType">Tipo de Tumor</Label>
              <Select onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o Tipo de Tumor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Glioma">Glioma</SelectItem>
                  <SelectItem value="Meningioma">Meningioma</SelectItem>
                  <SelectItem value="Metástase">Metástase</SelectItem>
                  <SelectItem value="Pituitário">Pituitário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Anotações</Label>
              <Textarea
                id="notes"
                placeholder="Anotações adicionais sobre a análise"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button onClick={handleDetect} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detectando...
                </>
              ) : (
                "Detectar Tumores"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Canvas Section */}
        <Card>
          <CardHeader>
            <CardTitle>Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} />
            {detections.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">Deteções:</h3>
                <ul>
                  {detections.map((detection, index) => (
                    <li key={index} className="text-sm">
                      {detection.label} (x1: {detection.x1}, y1: {detection.y1}, x2: {detection.x2}, y2:{" "}
                      {detection.y2})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analise;

// Custom trigger and content components for Listbox
interface ListboxTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ListboxTrigger = React.forwardRef<HTMLButtonElement, ListboxTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        variant="outline"
        role="listbox"
        ref={ref}
        className={`w-full justify-between text-sm ${className}`}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
ListboxTrigger.displayName = "ListboxTrigger";

interface ListboxContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ListboxContent = React.forwardRef<HTMLDivElement, ListboxContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[side=bottom]:animate-slide-in-from-top data-[side=left]:animate-slide-in-from-right data-[side=right]:animate-slide-in-from-left data-[side=top]:animate-slide-in-from-bottom ${className}`}
        {...props}
      >
        <Listbox>
          <ul className="py-1">{children}</ul>
        </Listbox>
      </div>
    );
  }
);
ListboxContent.displayName = "ListboxContent";
