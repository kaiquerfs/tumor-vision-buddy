
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define what an analyzed image entry looks like
export interface DetectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

export interface AnalysisEntry {
  id: string;
  imageUrl: string;
  fileName: string;
  timestamp: number;
  detections: DetectionBox[];
}

interface HistoryContextType {
  history: AnalysisEntry[];
  addToHistory: (entry: Omit<AnalysisEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<AnalysisEntry[]>([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("analysisHistory");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading history from localStorage:", error);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("analysisHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving history to localStorage:", error);
    }
  }, [history]);

  const addToHistory = (entry: Omit<AnalysisEntry, "id" | "timestamp">) => {
    const newEntry: AnalysisEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setHistory((prev) => [newEntry, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
