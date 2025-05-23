export interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  examDate: string;
}

// Update the AnalysisEntry type to include doctorInfo
export interface AnalysisEntry {
  id: string;
  imageUrl: string;
  patientId?: string;
  patientName?: string;
  timestamp: number;
  detections: Detection[];
  notes?: string;
  doctorInfo?: {
    name: string;
    crm: string;
    uf: string;
  };
}
