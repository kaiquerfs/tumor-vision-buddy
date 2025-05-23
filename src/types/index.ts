export interface Detection {
  label: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AnalysisEntry {
  id: string;
  timestamp: number;
  imageUrl: string;
  imageWithDetections?: string;
  fileName: string;
  detections: Detection[];
  patientId?: string;
  patientName?: string;
  doctorInfo?: {
    name: string;
    crm: string;
    uf: string;
  };
}
