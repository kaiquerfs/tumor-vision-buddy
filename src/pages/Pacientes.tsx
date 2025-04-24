import { useHistory, AnalysisEntry } from "@/contexts/HistoryContext";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AnalysisHistoryTable } from "@/components/AnalysisHistoryTable";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

const Pacientes = () => {
  const { history } = useHistory();
  const navigate = useNavigate();

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

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm:ss");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Gerenciamento de Pacientes
        </h1>
        <Button onClick={() => navigate('/analise')}>Nova Análise</Button>
      </div>

      {history.length === 0 ? (
        <Card className="bg-muted">
          <CardContent className="flex flex-col items-center justify-center p-10">
            <Users className="w-16 h-16 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">Nenhuma análise encontrada</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Realize uma análise para visualizar o histórico do paciente.
            </p>
            <Button onClick={() => navigate('/analise')}>
              Realizar análise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <AnalysisHistoryTable
              history={history}
              onExportPDF={exportToPDF}
              onDownloadImage={downloadImage}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pacientes;
