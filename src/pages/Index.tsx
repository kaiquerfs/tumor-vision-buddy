
import { useState, useEffect } from "react";
import { Sun, Moon, Upload, FileImage, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Carregar preferência de tema do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
    }
  }, []);

  // Alternar modo escuro e salvar preferência
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", String(newMode));
      return newMode;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setImage(URL.createObjectURL(file));
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
      toast.success("Análise concluída com sucesso");
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao processar a imagem. Verifique se o servidor está online.");
    } finally {
      setIsLoading(false);
    }
  };

  // Overlay for mobile when sidebar is open
  const SidebarOverlay = () => (
    <div 
      className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isMobileSidebarOpen ? "block" : "hidden"}`}
      onClick={toggleMobileSidebar}
    />
  );

  return (
    <div 
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } min-h-screen flex transition-all duration-300`}
    >
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
      />
      <SidebarOverlay />
      
      {/* Main content area */}
      <div className="flex-1 md:ml-64 p-4 md:p-6">
        {/* Header with title and toggle buttons */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMobileSidebar}
              className={`md:hidden rounded-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
              🧑‍⚕️ Análise de Tumores
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className={`rounded-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Container principal */}
        <div className="w-full max-w-7xl mx-auto">
          {/* Área de upload */}
          <Card className={`mb-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-semibold">Envie uma imagem para análise</h2>
                
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
                  <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                    <img 
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
                      detections.map((box, index) => (
                        <div
                          key={index}
                          className="absolute border-4 border-red-500 rounded-lg shadow-md"
                          style={{
                            left: `${box.x1}px`,
                            top: `${box.y1}px`,
                            width: `${box.x2 - box.x1}px`,
                            height: `${box.y2 - box.y1}px`,
                          }}
                        >
                          <div
                            className="absolute bg-red-600 text-white text-sm font-semibold px-2 py-1 rounded-lg shadow-md"
                            style={{
                              top: "-28px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {box.label} ({box.confidence}%)
                          </div>
                        </div>
                      ))
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
        </div>
        
        {/* Footer */}
        <footer className="mt-auto pt-8 text-center text-sm opacity-70">
          <p>© 2025 TumorVision Buddy - Ferramenta de auxílio para detecção de tumores</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
