import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveToIndexedDB, getAllFromIndexedDB, clearIndexedDB } from "@/utils/indexedDB";
import { toast } from "sonner";

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
  imageWithDetections?: string; // New property to store image with detections
}

interface HistoryContextType {
  history: AnalysisEntry[];
  addToHistory: (entry: Omit<AnalysisEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
  isLoading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<AnalysisEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from IndexedDB on component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const entries = await getAllFromIndexedDB();
        setHistory(entries);
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error("Falha ao carregar o histórico");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const addToHistory = async (entry: Omit<AnalysisEntry, "id" | "timestamp">) => {
    try {
      const newEntry: AnalysisEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      await saveToIndexedDB(newEntry);
      setHistory((prev) => [newEntry, ...prev]);
    } catch (error) {
      console.error("Failed to add entry to history:", error);
      toast.error("Falha ao salvar no histórico");
    }
  };

  const clearHistory = async () => {
    try {
      await clearIndexedDB();
      setHistory([]);
      toast.success("Histórico limpo com sucesso");
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("Falha ao limpar o histórico");
    }
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory, isLoading }}>
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