
import { useState, useEffect, useRef } from "react";
import { Upload, FileImage, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useHistory } from "@/contexts/HistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePatient } from "@/contexts/PatientContext";
import { Navigate } from "react-router-dom";
import html2canvas from "html2canvas";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IndexProps {
  darkMode: boolean;
}

const Index = ({ darkMode }: IndexProps) => {
  const { isAuthenticated, user } = useAuth();
  const { currentPatient } = usePatient();
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
  const [isLoading, setIsLoading] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const detectionsRef = useRef<HTMLDivElement>(null);
  const { addToHistory } = useHistory();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Get original image dimensions before setting the image URL
      const img = new Image();
      img.onload = () => {
        setOriginalImageSize({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src); // Clean up
      };
      
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;
      setImage(imageUrl);
      
      sendImageToBackend(file);
    }
  };

  const captureImageWithDetections = async () => {
    if (!detectionsRef.current) return null;
    
    try {
      const canvas = await html2canvas(detectionsRef.current);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error("Error capturing image with detections:", error);
      return null;
    }
  };

  const sendImageToBackend = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
        headers: { 
          "ngrok-skip-browser-warning": "true",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      setDetections(data.detections);
      
      // Wait for detections to render before capturing
      setTimeout(async () => {
        // Save to history after successful analysis
        if (image) {
          const imageWithDetections = await captureImageWithDetections();
          
          addToHistory({
            imageUrl: image,
            fileName: fileName,
            detections: data.detections,
            imageWithDetections: imageWithDetections || undefined,
            patientId: currentPatient?.id,
            patientName: currentPatient?.name,
            doctorInfo: user ? {
              name: user.NM_MEDICO,
              crm: user.NU_CRM,
              specialty: user.ESPECIALIDADE,
              uf: user.SG_UF
            } : undefined
          });
          toast.success("Análise concluída e salva no histórico");
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao processar a imagem. Verifique se o servidor está online.");
      setIsLoading(false);
    }
  };

  // Calculate scale factors based on displayed image size
  const getScaleFactors = () => {
    if (!imageRef.current || originalImageSize.width === 0) {
      return { scaleX: 1, scaleY: 1 };
    }
    
    const displayedWidth = imageRef.current.clientWidth;
    const displayedHeight = imageRef.current.clientHeight;
    
    return {
      scaleX: displayedWidth / originalImageSize.width,
      scaleY: displayedHeight / originalImageSize.height
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 mb-8">
        🧑‍⚕️ Análise de Tumores
      </h1>
      
      {/* Área de upload */}
      <Card className={`mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold">Envie uma imagem para análise</h2>
            
            {/* Patient selection */}
            <div className="w-full max-w-xs">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Paciente selecionado:</span>
              </div>
              {currentPatient ? (
                <div className="p-3 border rounded-md bg-muted/50">
                  <div className="font-medium">{currentPatient.name}</div>
                  <div className="text-sm text-muted-foreground">Prontuário: {currentPatient.id}</div>
                </div>
              ) : (
                <div className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded-md flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span>Nenhum paciente selecionado. Selecione um paciente na página de pacientes.</span>
                </div>
              )}
            </div>
            
            <label 
              className={`cursor-pointer flex items-center gap-2 ${
                darkMode ? "bg-blue-600" : "bg-blue-500"
              } text-white px-6 py-3 rounded-lg hover:opacity-90 transition duration-200 shadow-md`}
            >
              <Upload className="w-5 h-5" />
              Escolher Imagem
              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
            
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              {fileName}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Área de visualização */}
      {image && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagem original */}
          <Card className={`${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Imagem Original
              </h2>
              <Separator className="mb-4" />
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img 
                  src={image} 
                  alt="Original" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </CardContent>
          </Card>

          {/* Imagem com detecções */}
          <Card className={`${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Detecções de Tumores
              </h2>
              <Separator className="mb-4" />
              <div 
                ref={detectionsRef}
                className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative"
              >
                <img 
                  ref={imageRef}
                  src={image} 
                  alt="Com detecções" 
                  className="w-full h-auto object-contain"
                  onLoad={() => {
                    // Force a re-render so we get accurate image dimensions after loading
                    setDetections([...detections]);
                  }}
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
      
      {/* Instrução inicial */}
      {!image && (
        <div className={`text-center p-10 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
          <FileImage className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl">Envie uma imagem para iniciar a detecção de tumores</p>
        </div>
      )}
      
      {/* Footer */}
      <footer className="mt-auto pt-8 text-center text-sm opacity-70">
        <p>© 2025 TumorVision Buddy - Ferramenta de auxílio para detecção de tumores</p>
      </footer>
    </div>
  );
};

export default Index;
