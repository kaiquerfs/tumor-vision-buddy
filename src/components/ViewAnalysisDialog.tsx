
import { Eye, FileImage, Info, FileText, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisEntry } from "@/contexts/HistoryContext";
import { useState } from "react";

interface ViewAnalysisDialogProps {
  entry: AnalysisEntry;
  onExportPDF: (entry: AnalysisEntry) => void;
  onDownloadImage: (entry: AnalysisEntry) => void;
  formatDate: (timestamp: number) => string;
  formatTime: (timestamp: number) => string;
}

export const ViewAnalysisDialog = ({ 
  entry, 
  onExportPDF, 
  onDownloadImage,
  formatDate,
  formatTime,
}: ViewAnalysisDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              {entry.fileName}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="detalhes" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="imagem">Imagem</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detalhes" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Informações da Análise
                  </h3>
                  <Separator className="mb-3" />
                  
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Paciente:</div>
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {entry.patientName || "Não informado"}
                    </div>
                    
                    <div className="text-muted-foreground">Data:</div>
                    <div>{formatDate(entry.timestamp)}</div>
                    
                    <div className="text-muted-foreground">Hora:</div>
                    <div>{formatTime(entry.timestamp)}</div>
                    
                    <div className="text-muted-foreground">Total de detecções:</div>
                    <div className="font-medium">{entry.detections.length}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => onExportPDF(entry)} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                  <Button 
                    onClick={() => onDownloadImage(entry)} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Imagem
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Detecções</h3>
                <Separator className="mb-3" />
                
                {entry.detections.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma detecção encontrada
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-56 pr-2">
                    {entry.detections.map((detection, index) => (
                      <div key={index} className="mb-3 p-3 border rounded-md bg-muted/30">
                        <div className="font-medium text-sm">
                          {index + 1}. {detection.label}
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs text-muted-foreground">
                          <div>X1: {detection.x1.toFixed(0)}</div>
                          <div>Y1: {detection.y1.toFixed(0)}</div>
                          <div>X2: {detection.x2.toFixed(0)}</div>
                          <div>Y2: {detection.y2.toFixed(0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="imagem" className="mt-4">
            <div className="border rounded-md overflow-hidden">
              <img 
                src={entry.imageWithDetections || entry.imageUrl}
                alt={entry.fileName}
                className="w-full h-auto max-h-[70vh] object-contain bg-zinc-900/5 p-2"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
