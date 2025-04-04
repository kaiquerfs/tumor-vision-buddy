
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Brain, FileImage, Trash2, Eye, Info, Calendar, Clock } from "lucide-react";
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
import { useHistory, AnalysisEntry, DetectionBox } from "@/contexts/HistoryContext";
import { toast } from "sonner";

const Historico = () => {
  const { history, clearHistory } = useHistory();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<AnalysisEntry | null>(null);

  const handleClearHistory = () => {
    clearHistory();
    toast.success("Histórico limpo com sucesso");
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm:ss");
  };

  // Component to display detections on a selected image
  const ImageWithDetections = ({ entry }: { entry: AnalysisEntry }) => {
    return (
      <div className="relative inline-block">
        <img 
          src={entry.imageUrl} 
          alt={entry.fileName}
          className="max-w-full h-auto rounded-md"
        />
        
        {entry.detections.map((box: DetectionBox, index: number) => (
          <div
            key={index}
            className="absolute border-4 border-red-500 rounded-lg"
            style={{
              left: `${box.x1}px`,
              top: `${box.y1}px`,
              width: `${box.x2 - box.x1}px`,
              height: `${box.y2 - box.y1}px`,
              transform: "scale(0.5)",
              transformOrigin: "top left"
            }}
          >
            <div
              className="absolute bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                top: "-24px",
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
              }}
            >
              {box.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
                          src={entry.imageUrl} 
                          alt={entry.fileName}
                          className="w-full h-full object-cover" 
                        />
                        {entry.detections.length > 0 && (
                          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-xs px-1 py-0.5 rounded-sm">
                              {entry.detections.length}
                            </span>
                          </div>
                        )}
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
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl">
                                <div className="flex items-center gap-2">
                                  <FileImage className="h-5 w-5" />
                                  {entry.fileName}
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Info className="h-4 w-4" />
                                  Detalhes da Análise
                                </h3>
                                <Separator className="mb-3" />
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Data:</span>
                                    <span>{formatDate(entry.timestamp)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hora:</span>
                                    <span>{formatTime(entry.timestamp)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Detecções:</span>
                                    <span>{entry.detections.length}</span>
                                  </div>
                                  
                                  {entry.detections.length > 0 && (
                                    <>
                                      <Separator className="my-2" />
                                      <h4 className="font-medium">Coordenadas:</h4>
                                      <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                                        {entry.detections.map((box, i) => (
                                          <div key={i} className="text-xs">
                                            <div className="font-medium text-sm">{box.label}</div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                              <div>X1: {box.x1.toFixed(0)}</div>
                                              <div>Y1: {box.y1.toFixed(0)}</div>
                                              <div>X2: {box.x2.toFixed(0)}</div>
                                              <div>Y2: {box.y2.toFixed(0)}</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <FileImage className="h-4 w-4" />
                                  Visualização da Imagem
                                </h3>
                                <Separator className="mb-3" />
                                
                                <div className="border rounded-md overflow-hidden">
                                  <ImageWithDetections entry={entry} />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Fechar</Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
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
