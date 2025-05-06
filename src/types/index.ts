export interface Paciente {
    id: string;
    nome: string;
    idade: number;
    sexo: string;
  }
  
  export interface Detection {
    label: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }
  
  export interface AnalysisEntry {
    id: string;
    fileName: string;
    imageUrl: string;
    imageWithDetections?: string;
    timestamp: number;
    detections: Detection[];
    paciente?: Paciente; // <-- novo campo
    patientId: string;
  }
  