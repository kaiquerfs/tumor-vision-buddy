
import { useState } from "react";
import { useHistory, AnalysisEntry } from "@/contexts/HistoryContext";
import { Card, CardContent } from "@/components/ui/card";
import { FileImage, CalendarIcon, Download, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ViewAnalysisDialog } from "./ViewAnalysisDialog";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface PatientAnalysesListProps {
  patientId: string;
}

export function PatientAnalysesList({ patientId }: PatientAnalysesListProps) {
  const { history } = useHistory();
  const patientAnalyses = history.filter(analysis => analysis.patientId === patientId);

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
              <ViewAnalysisDialog
                entry={analysis}
                onExportPDF={exportToPDF}
                onDownloadImage={downloadImage}
                formatDate={formatDate}
                formatTime={formatTime}
              />
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
