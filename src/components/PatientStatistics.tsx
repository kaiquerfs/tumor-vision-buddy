
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ChartBarIcon } from "lucide-react";
import { AnalysisEntry } from "@/contexts/HistoryContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface PatientStatisticsProps {
  history: AnalysisEntry[];
  colors: string[];
}

export function PatientStatistics({ history, colors }: PatientStatisticsProps) {
  const [showAllPatients, setShowAllPatients] = useState(false);
  
  // Generate patient statistics
  const patientData = useMemo(() => {
    const patientAnalysisCount: Record<string, { name: string, analyses: number, detections: number }> = {};
    
    history.forEach(entry => {
      if (!entry.patientId || !entry.patientName) return;
      
      if (!patientAnalysisCount[entry.patientId]) {
        patientAnalysisCount[entry.patientId] = {
          name: entry.patientName,
          analyses: 0,
          detections: 0
        };
      }
      
      patientAnalysisCount[entry.patientId].analyses += 1;
      patientAnalysisCount[entry.patientId].detections += entry.detections.length;
    });
    
    return Object.values(patientAnalysisCount)
      .sort((a, b) => b.analyses - a.analyses || b.detections - a.detections);
  }, [history]);
  
  // Limit displayed patients unless "show all" is clicked
  const displayedPatients = showAllPatients ? patientData : patientData.slice(0, 5);
  
  if (patientData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estatísticas por Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Não existem dados de pacientes suficientes para gerar estatísticas.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Análises por Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayedPatients}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="analyses" 
                name="Análises" 
                fill="#8884d8"
              >
                {displayedPatients.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Bar>
              <Bar 
                dataKey="detections" 
                name="Detecções" 
                fill="#82ca9d"
              />
            </BarChart>
          </ResponsiveContainer>
          
          {patientData.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAllPatients(!showAllPatients)}
              >
                {showAllPatients ? "Mostrar menos" : `Mostrar todos (${patientData.length})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
