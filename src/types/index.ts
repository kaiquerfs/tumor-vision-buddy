
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

export interface DoctorInfo {
  name: string;
  crm: string;
  specialty: string;
  uf: string;
}
  
export interface AnalysisEntry {
    id: string;
    fileName: string;
    imageUrl: string;
    imageWithDetections?: string;
    timestamp: number;
    detections: Detection[];
    paciente?: Paciente;
    patientId: string;
    patientName?: string;
    doctorInfo?: DoctorInfo;
}
