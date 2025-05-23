
import React from "react";
import { AnalysisEntry, useHistory } from "@/contexts/HistoryContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileImage, Calendar, Clock, Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { ViewAnalysisDialog } from "./ViewAnalysisDialog"; // Changed from default to named import

interface PatientAnalysesListProps {
  patientId: string;
}

const PatientAnalysesList: React.FC<PatientAnalysesListProps> = ({ patientId }) => {
  const { history } = useHistory();
  
  // Filter analyses for this specific patient
  const patientAnalyses = history.filter(entry => entry.patientId === patientId);
  
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
      
      if (entry.patientName) {
        doc.text(`Paciente: ${entry.patientName}`, 20, 75);
        
        entry.detections.forEach((detection, index) => {
          doc.text(
            `${index + 1}. ${detection.label} [x1: ${detection.x1.toFixed(0)}, y1: ${detection.y1.toFixed(0)}, x2: ${detection.x2.toFixed(0)}, y2: ${detection.y2.toFixed(0)}]`,
            20,
            85 + index * 10
          );
        });
      } else {
        entry.detections.forEach((detection, index) => {
          doc.text(
            `${index + 1}. ${detection.label} [x1: ${detection.x1.toFixed(0)}, y1: ${detection.y1.toFixed(0)}, x2: ${detection.x2.toFixed(0)}, y2: ${detection.y2.toFixed(0)}]`,
            20,
            75 + index * 10
          );
        });
      }

      if (entry.imageWithDetections) {
        const img = new Image();
        img.src = entry.imageWithDetections;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const width = 160;
          const height = width / aspectRatio;
          const startY = entry.patientName ? 90 + entry.detections.length * 10 : 80 + entry.detections.length * 10;
          doc.addImage(img, "JPEG", 20, startY, width, height);
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
      <Card className="bg-muted">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <FileImage className="w-12 h-12 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">Nenhuma análise encontrada</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Este paciente ainda não possui análises de imagem. Vá para a página de Análise para realizar um exame.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/analise'}>
            Realizar Análise
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patientAnalyses.map((entry) => (
        <Card key={entry.id} className="overflow-hidden">
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img 
              src={entry.imageWithDetections || entry.imageUrl} 
              alt={entry.fileName}
              className="w-full h-full object-contain" 
            />
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium truncate">{entry.fileName}</h3>
              <span className="bg-red-100 text-red-800 text-xs py-0.5 px-2 rounded-full">
                {entry.detections.length} detecções
              </span>
            </div>
            
            <div className="flex flex-col space-y-1 mb-3">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> 
                {formatDate(entry.timestamp)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> 
                {formatTime(entry.timestamp)}
              </span>
            </div>

            <div className="flex space-x-2 justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => exportToPDF(entry)} className="w-10 p-0">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadImage(entry)} className="w-10 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              <ViewAnalysisDialog 
                entry={entry}
                onExportPDF={exportToPDF}
                onDownloadImage={downloadImage}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PatientAnalysesList;
