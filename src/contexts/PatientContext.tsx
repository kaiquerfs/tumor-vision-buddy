
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export type Patient = {
  id: string;
  name: string;
  birthdate?: string;
  gender?: string;
  prontuario?: string;
  idade?: string;
};

type PatientContextType = {
  patients: Patient[];
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient | null) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patient: Patient) => void;
  removePatient: (id: string) => void;
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // Load patients from localStorage on component mount
  useEffect(() => {
    const savedPacientes = localStorage.getItem("pacientes");
    if (savedPacientes) {
      try {
        const parsed = JSON.parse(savedPacientes);
        const formatted = parsed.map((p: any) => ({
          id: p.id,
          name: p.nome,
          gender: p.genero,
          prontuario: p.prontuario,
          idade: p.idade
        }));
        setPatients(formatted);
      } catch (error) {
        console.error("Error parsing patients from localStorage:", error);
      }
    }
  }, []);

  // Save patients to localStorage whenever the patients array changes
  useEffect(() => {
    if (patients.length > 0) {
      // Convert to the format expected by the existing code
      const formatted = patients.map(p => ({
        id: p.id,
        nome: p.name,
        genero: p.gender || "",
        prontuario: p.prontuario || "",
        idade: p.idade || ""
      }));
      localStorage.setItem("pacientes", JSON.stringify(formatted));
    }
  }, [patients]);

  const addPatient = (patient: Patient) => {
    setPatients(prev => [...prev, patient]);
    toast.success(`Paciente ${patient.name} cadastrado com sucesso`);
  };

  const updatePatient = (id: string, patient: Patient) => {
    setPatients(prev => 
      prev.map(p => p.id === id ? { ...patient, id } : p)
    );
    
    // Also update currentPatient if it's being edited
    if (currentPatient?.id === id) {
      setCurrentPatient({ ...patient, id });
    }
    
    toast.success(`Paciente ${patient.name} atualizado com sucesso`);
  };

  const removePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    
    // Reset currentPatient if it's being removed
    if (currentPatient?.id === id) {
      setCurrentPatient(null);
    }
    
    toast.success("Paciente removido com sucesso");
  };

  return (
    <PatientContext.Provider 
      value={{ 
        patients, 
        currentPatient, 
        setCurrentPatient,
        addPatient,
        updatePatient,
        removePatient
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient deve ser usado dentro de um PatientProvider");
  }
  return context;
};
