import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { trpc } from "@/providers/trpc";

// ─── App-wide shared state for selected student ───
interface AppDataContextType {
  selectedStudentId: number | null;
  selectedStudentName: string | null;
  setSelectedStudent: (id: number | null, name: string | null) => void;
  refetchStudents: () => void;
}

const AppDataContext = createContext<AppDataContextType>({
  selectedStudentId: null,
  selectedStudentName: null,
  setSelectedStudent: () => {},
  refetchStudents: () => {},
});

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const setSelectedStudent = useCallback((id: number | null, name: string | null) => {
    setSelectedStudentId(id);
    setSelectedStudentName(name);
  }, []);

  const refetchStudents = useCallback(() => {
    utils.student.list.invalidate();
  }, [utils]);

  return (
    <AppDataContext.Provider
      value={{ selectedStudentId, selectedStudentName, setSelectedStudent, refetchStudents }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
