
import { useState, useEffect } from "react";
import { 
  BarChart3, 
  ChartPie, 
  Calendar, 
  Users, 
  Brain,
  ChartBarIcon,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistory } from "@/contexts/HistoryContext";
import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { StatisticsCard } from "@/components/StatisticsCard";
import { PatientStatistics } from "@/components/PatientStatistics";
import { DetectionStatistics } from "@/components/DetectionStatistics";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#8dd1e1'];

const Estatisticas = () => {
  const { history } = useHistory();
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Simulate loading statistics
    const timer = setTimeout(() => {
      setLoadingStats(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Compute total metrics
  const totalAnalyses = history.length;
  const totalPatients = new Set(history.filter(item => item.patientId).map(item => item.patientId)).size;
  const totalDetections = history.reduce((acc, item) => acc + item.detections.length, 0);
  
  // Calculate average detections per image
  const avgDetectionsPerImage = totalAnalyses > 0 
    ? (totalDetections / totalAnalyses).toFixed(1) 
    : '0';

  // Get detection types and counts
  const detectionCounts = history.reduce((acc, analysis) => {
    analysis.detections.forEach(detection => {
      const label = detection.label;
      acc[label] = (acc[label] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const detectionData = Object.entries(detectionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Create timeline data for last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      analyses: 0
    };
  });

  // Populate timeline data
  history.forEach(entry => {
    const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
    const dayIndex = last30Days.findIndex(day => day.date === date);
    if (dayIndex >= 0) {
      last30Days[dayIndex].analyses += 1;
    }
  });
  
  // Format timeline data for display
  const timelineData = last30Days.map(day => ({
    date: format(parseISO(day.date), 'dd/MM'),
    analyses: day.analyses
  }));

  if (loadingStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <BarChart3 className="w-16 h-16 mb-4 text-blue-500 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2">Carregando estatísticas...</h1>
      </div>
    );
  }
  
  // If there's no data, show empty state
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <BarChart3 className="w-16 h-16 mb-4 text-blue-500" />
        <h1 className="text-2xl font-bold mb-2">Estatísticas</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Não há dados suficientes para gerar estatísticas. Realize algumas análises para visualizar métricas e gráficos.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Estatísticas
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize métricas e gráficos sobre as análises realizadas
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatisticsCard 
          title="Total de Análises" 
          value={totalAnalyses.toString()} 
          description="Análises realizadas" 
          icon={Brain}
          trend={totalAnalyses > 0 ? "+100%" : "0%"}
          trendIncreasing={totalAnalyses > 0}
        />
        <StatisticsCard 
          title="Pacientes" 
          value={totalPatients.toString()} 
          description="Pacientes analisados" 
          icon={Users}
          trend={totalPatients > 0 ? "+100%" : "0%"}
          trendIncreasing={totalPatients > 0}
        />
        <StatisticsCard 
          title="Detecções" 
          value={totalDetections.toString()} 
          description="Tumores detectados" 
          icon={ChartPie}
          trend={totalDetections > 0 ? "+100%" : "0%"}
          trendIncreasing={totalDetections > 0}
        />
        <StatisticsCard 
          title="Média por Análise" 
          value={avgDetectionsPerImage} 
          description="Detecções por imagem" 
          icon={TrendingUp}
          trend={`${avgDetectionsPerImage}`}
          trendIncreasing={parseFloat(avgDetectionsPerImage) > 0}
        />
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="detections">Detecções</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Análises ao longo do tempo
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="analyses" 
                    stroke="#8884d8" 
                    name="Análises"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detections" className="space-y-4">
          <DetectionStatistics detectionData={detectionData} colors={COLORS} />
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <PatientStatistics history={history} colors={COLORS} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Estatisticas;
