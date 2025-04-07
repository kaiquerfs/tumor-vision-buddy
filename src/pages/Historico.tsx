import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import { Brain, FileImage, Trash2, Eye, Info, Calendar, Clock, Loader2, Download, FileText } from "lucide-react";
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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHistory, AnalysisEntry } from "@/contexts/HistoryContext";
import { toast } from "sonner";

const Historico = () => {
  const { history, clearHistory, isLoading } = useHistory();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<AnalysisEntry | null>(null);

  const handleClearHistory = () => {
    clearHistory();
  };

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
      doc.text(`Data: ${date}`, 20, 45);
      doc.text(`Hora: ${time}`, 20, 55);
      doc.text(`Detecções: ${entry.detections.length}`, 20, 65);

      entry.detections.forEach((detection, index) => {
        doc.text(
          `${index + 1}. ${detection.label} [x1: ${detection.x1.toFixed(0)}, y1: ${detection.y1.toFixed(0)}, x2: ${detection.x2.toFixed(0)}, y2: ${detection.y2.toFixed(0)}]`,
          20,
          75 + index * 10
        );
      });

      if (entry.imageWithDetections) {
        const img = new Image();
        img.src = entry.imageWithDetections;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const width = 160;
          const height = width / aspectRatio;
          doc.addImage(img, "JPEG", 20, 90 + entry.detections.length * 10, width, height);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Histórico de Análises
        </h1>
        
        {history.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleClearHistory}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Histórico
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="bg-muted">
          <CardContent className="flex flex-col items-center justify-center p-10">
            <FileImage className="w-16 h-16 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">Sem análises no histórico</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              As imagens analisadas serão exibidas aqui para referência futura.
            </p>
            <Button onClick={() => navigate('/analise')}>
              Ir para análise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Detecções</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="relative w-16 h-16 overflow-hidden rounded-md border">
                        <img 
                          src={entry.imageWithDetections || entry.imageUrl} 
                          alt={entry.fileName}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium truncate max-w-[150px]">{entry.fileName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" /> 
                          {formatDate(entry.timestamp)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> 
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{entry.detections.length} detecções</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.detections.slice(0, 2).map((box, index) => (
                            <span 
                              key={index} 
                              className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs"
                            >
                              {box.label}
                            </span>
                          ))}
                          {entry.detections.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-xs">
                              +{entry.detections.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => exportToPDF(entry)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadImage(entry)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedImage(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          
                          {selectedImage?.id === entry.id && (
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
                                          <Info className="h-4 w-4" />
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Historico;