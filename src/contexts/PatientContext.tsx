import React, { createContext, useContext, useState, ReactNode } from "react";

export type Patient = {
  id: string;
  name: string;
  birthdate: string;
  gender: string;
};

type PatientContextType = {
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient | null) => void;
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  return (
    <PatientContext.Provider value={{ currentPatient, setCurrentPatient }}>
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
