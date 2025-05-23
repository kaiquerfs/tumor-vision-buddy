
import { useState } from "react";
import { useHistory, AnalysisEntry } from "@/contexts/HistoryContext";
import { Card, CardContent } from "@/components/ui/card";
import { FileImage, CalendarIcon, Download, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientAnalysesListProps {
  patientId: string;
}

export function PatientAnalysesList({ patientId }: PatientAnalysesListProps) {
  const { history } = useHistory();
  const patientAnalyses = history.filter(analysis => analysis.patientId === patientId);
  const [selectedImage, setSelectedImage] = useState<AnalysisEntry | null>(null);

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm:ss");
  };

  const exportToPDF = (entry: AnalysisEntry) => {
    try {
      const doc = new jsPDF();
      const date = formatDate(entry.timestamp);
      const time = formatTime(entry.timestamp);

      doc.setFontSize(16);
      doc.text("Relatório de Análise", 20, 20);

      doc.setFontSize(12);
      doc.text(`Arquivo: ${entry.fileName}`, 20, 35);
      doc.text(`Paciente: ${entry.patientName || "Não informado"}`, 20, 45);
      doc.text(`Data: ${date}`, 20, 55);
      doc.text(`Hora: ${time}`, 20, 65);
      doc.text(`Detecções: ${entry.detections.length}`, 20, 75);

      entry.detections.forEach((detection, index) => {
        doc.text(
          `${index + 1}. ${detection.label} [x1: ${detection.x1.toFixed(0)}, y1: ${detection.y1.toFixed(0)}, x2: ${detection.x2.toFixed(0)}, y2: ${detection.y2.toFixed(0)}]`,
          20,
          85 + index * 10
        );
      });

      if (entry.imageWithDetections) {
        const img = new Image();
        img.src = entry.imageWithDetections;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const width = 160;
          const height = width / aspectRatio;
          doc.addImage(img, "JPEG", 20, 100 + entry.detections.length * 10, width, height);
          doc.save(`analise_${entry.id}.pdf`);
          toast.success("PDF exportado com sucesso");
        };
      } else {
        doc.save(`analise_${entry.id}.pdf`);
        toast.success("PDF exportado com sucesso");
      }
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const downloadImage = (entry: AnalysisEntry) => {
    try {
      const link = document.createElement("a");
      link.href = entry.imageWithDetections || entry.imageUrl;
      link.download = entry.fileName || "imagem_analise.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Imagem baixada com sucesso");
    } catch (error) {
      console.error("Erro ao baixar imagem:", error);
      toast.error("Erro ao baixar imagem");
    }
  };

  if (patientAnalyses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <FileImage className="w-16 h-16 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">Sem análises para este paciente</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Este paciente ainda não possui análises registradas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patientAnalyses.map(analysis => (
        <Card key={analysis.id} className="overflow-hidden">
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img 
              src={analysis.imageWithDetections || analysis.imageUrl} 
              alt={analysis.fileName} 
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4">
            <div className="mb-3">
              <h3 className="font-medium text-sm truncate" title={analysis.fileName}>
                {analysis.fileName}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {formatDate(analysis.timestamp)} às {formatTime(analysis.timestamp)}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-xs font-medium mb-1">Detecções:</div>
              <div className="flex flex-wrap gap-1">
                {analysis.detections.slice(0, 3).map((detection, index) => (
                  <span 
                    key={index} 
                    className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs"
                  >
                    {detection.label}
                  </span>
                ))}
                {analysis.detections.length > 3 && (
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                    +{analysis.detections.length - 3}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedImage(analysis)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                
                {selectedImage?.id === analysis.id && (
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        <div className="flex items-center gap-2">
                          <FileImage className="h-5 w-5" />
                          {selectedImage.fileName}
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
                                <FileImage className="h-4 w-4" />
                                Informações da Análise
                              </h3>
                              <Separator className="mb-3" />
                              
                              <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div className="text-muted-foreground">Data:</div>
                                <div>{formatDate(selectedImage.timestamp)}</div>
                                
                                <div className="text-muted-foreground">Hora:</div>
                                <div>{formatTime(selectedImage.timestamp)}</div>
                                
                                <div className="text-muted-foreground">Total de detecções:</div>
                                <div className="font-medium">{selectedImage.detections.length}</div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => exportToPDF(selectedImage)} 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar PDF
                              </Button>
                              <Button 
                                onClick={() => downloadImage(selectedImage)} 
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
                            
                            {selectedImage.detections.length === 0 ? (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma detecção encontrada
                              </div>
                            ) : (
                              <div className="overflow-y-auto max-h-56 pr-2">
                                {selectedImage.detections.map((detection, index) => (
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
                            src={selectedImage.imageWithDetections || selectedImage.imageUrl}
                            alt={selectedImage.fileName}
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
                )}
              </Dialog>
              
              <Button variant="outline" size="sm" className="flex-1" onClick={() => exportToPDF(analysis)}>
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadImage(analysis)}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
