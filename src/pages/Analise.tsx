import { useState, useEffect, useRef } from "react";
import { FileImage, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useHistory } from "@/contexts/HistoryContext";

const Analise = () => {
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
  const [isLoading, setIsLoading] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const { addToHistory } = useHistory();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Get original image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalImageSize({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      
      const imageUrl = URL.createObjectURL(file);
      img.src = imageUrl;
      setImage(imageUrl);
      
      sendImageToBackend(file);
    }
  };

  const sendImageToBackend = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

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
      
      // Save to history after successful analysis
      if (image) {
        addToHistory({
          imageUrl: image,
          fileName: fileName,
          detections: data.detections,
        });
        toast.success("Análise concluída e salva no histórico");
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao processar a imagem. Verifique se o servidor está online.");
    } finally {
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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileImage className="h-6 w-6" />
        Análise Detalhada
      </h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold">Envie uma imagem para análise detalhada</h2>
            
            <Button onClick={() => document.getElementById('file-upload')?.click()}>
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
            
            <p className="text-sm text-muted-foreground">
              {fileName}
            </p>
          </div>
        </CardContent>
      </Card>

      {image && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Imagem original */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-3">Imagem Original</h2>
              <Separator className="mb-4" />
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={image} 
                  alt="Original" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </CardContent>
          </Card>

          {/* Imagem com detecções */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-3">Detecções e Diagnóstico</h2>
              <Separator className="mb-4" />
              <div className="rounded-lg overflow-hidden border relative">
                <img 
                  ref={imageRef}
                  src={image} 
                  alt="Com detecções" 
                  className="w-full h-auto object-contain"
                  onLoad={() => {
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
