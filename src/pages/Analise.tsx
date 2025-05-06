
import { useState, useEffect, useRef } from "react";
import { FileImage, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useHistory } from "@/contexts/HistoryContext";
import html2canvas from "html2canvas";

interface Paciente {
  id: string;
  nome: string;
  idade: string;
  genero: string;
  prontuario: string;
}

const Analise = () => {
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
  const [isLoading, setIsLoading] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null); // Estado para o paciente selecionado
  const imageRef = useRef<HTMLImageElement>(null);
  const detectionsRef = useRef<HTMLDivElement>(null);
  const { addToHistory } = useHistory();
  
  // Carregar pacientes do localStorage
  const pacientes = JSON.parse(localStorage.getItem("pacientes") || "[]");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setImage(base64Image);

        const img = new Image();
        img.onload = () => {
          setOriginalImageSize({ width: img.width, height: img.height });
        };
        img.src = base64Image;

        sendImageToBackend(file);
      };

      reader.readAsDataURL(file);
    }
  };

  const captureImageWithDetections = async () => {
    if (!detectionsRef.current) return null;

    try {
      const canvas = await html2canvas(detectionsRef.current);
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error capturing image with detections:", error);
      return null;
    }
  };

  const sendImageToBackend = async (file: File) => {
    if (!selectedPaciente) {
      toast.error("Selecione um paciente antes de enviar a imagem.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pacienteId", selectedPaciente.id);

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      setDetections(data.detections);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao processar a imagem. Verifique se o servidor está online.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!detections.length || !image || !selectedPaciente) return;
  
    // Primeiro, encerramos o loading
    setIsLoading(false);
  
    const timeout = setTimeout(() => {
      requestAnimationFrame(async () => {
        const imageWithDetections = await captureImageWithDetections();
  
        if (imageWithDetections) {
          addToHistory({
            imageUrl: image,
            fileName,
            detections,
            imageWithDetections,
            patientId: selectedPaciente.id,
            patientName: selectedPaciente.nome
          });
  
          toast.success("Análise concluída e salva no histórico");
        } else {
          toast.error("Erro ao capturar imagem para histórico");
        }
      });
    }, 200); // Pequeno delay para garantir que o overlay sumiu visualmente
    return () => clearTimeout(timeout);
  }, [detections, image, selectedPaciente]);

  const getScaleFactors = () => {
    if (!imageRef.current || originalImageSize.width === 0) {
      return { scaleX: 1, scaleY: 1 };
    }

    const displayedWidth = imageRef.current.clientWidth;
    const displayedHeight = imageRef.current.clientHeight;

    return {
      scaleX: displayedWidth / originalImageSize.width,
      scaleY: displayedHeight / originalImageSize.height,
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileImage className="h-6 w-6" />
        Análise Detalhada
      </h1>

      {/* Selecione um paciente */}
      <div className="mb-6">
        <label htmlFor="paciente-select" className="block text-sm font-medium mb-2">
          Selecione um Paciente:
        </label>
        <select
          id="paciente-select"
          className="w-full border p-2 rounded-md"
          onChange={(e) => {
            const pacienteId = e.target.value;
            const paciente = pacientes.find((p: Paciente) => p.id === pacienteId);
            setSelectedPaciente(paciente || null);
          }}
        >
          <option value="">Escolha um paciente</option>
          {pacientes.map((paciente: Paciente) => (
            <option key={paciente.id} value={paciente.id}>
              {paciente.nome}
            </option>
          ))}
        </select>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold">Envie uma imagem para análise detalhada</h2>

            <Button onClick={() => document.getElementById("file-upload")?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Escolher Imagem
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
            />

            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        </CardContent>
      </Card>

      {image && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-3">Imagem Original</h2>
              <Separator className="mb-4" />
              <div className="rounded-lg overflow-hidden border">
                <img src={image} alt="Original" className="w-full h-auto object-contain" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-3">Detecções e Diagnóstico</h2>
              <Separator className="mb-4" />
              <div
                ref={detectionsRef}
                className="rounded-lg overflow-hidden border relative"
              >
                <img
                  ref={imageRef}
                  src={image}
                  alt="Com detecções"
                  className="w-full h-auto object-contain"
                />

                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
                      <p>Analisando imagem...</p>
                    </div>
                  </div>
                ) : (
                  detections.map((box, index) => {
                    const { scaleX, scaleY } = getScaleFactors();

                    return (
                      <div
                        key={index}
                        className="absolute border-4 border-red-500 rounded-lg shadow-md"
                        style={{
                          left: `${box.x1 * scaleX}px`,
                          top: `${box.y1 * scaleY}px`,
                          width: `${(box.x2 - box.x1) * scaleX}px`,
                          height: `${(box.y2 - box.y1) * scaleY}px`,
                        }}
                      >
                        <div
                          className="absolute bg-red-600 text-white text-xs md:text-sm font-semibold px-2 py-1 rounded-lg shadow-md"
                          style={{
                            top: "-28px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {box.label}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!image && (
        <div className="text-center p-10 rounded-lg bg-muted shadow-sm">
          <FileImage className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl">Envie uma imagem para iniciar a análise detalhada</p>
        </div>
      )}
    </div>
  );
};

export default Analise;
