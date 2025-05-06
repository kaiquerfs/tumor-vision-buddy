
import { Calendar, Clock, Download, Eye, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnalysisEntry } from "@/contexts/HistoryContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ViewAnalysisDialog } from "./ViewAnalysisDialog";

interface AnalysisHistoryTableProps {
  history: AnalysisEntry[];
  onExportPDF: (entry: AnalysisEntry) => void;
  onDownloadImage: (entry: AnalysisEntry) => void;
}

export const AnalysisHistoryTable = ({ history, onExportPDF, onDownloadImage }: AnalysisHistoryTableProps) => {
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), "HH:mm:ss");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Imagem</TableHead>
          <TableHead>Nome do Arquivo</TableHead>
          <TableHead>Paciente</TableHead>
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
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{entry.patientName || "Não informado"}</span>
              </div>
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
                <Button variant="outline" size="sm" onClick={() => onExportPDF(entry)}>
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDownloadImage(entry)}>
                  <Download className="h-4 w-4" />
                </Button>
                <ViewAnalysisDialog 
                  entry={entry} 
                  onExportPDF={onExportPDF}
                  onDownloadImage={onDownloadImage}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
