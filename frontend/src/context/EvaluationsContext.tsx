import { createContext, useContext, useRef, useState } from "react";
import {
  fetchEvaluationCompletionStatus,
  submitEvaluation,
  fetchActiveEvaluationCycle,
} from "../services/api";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";
import type { ReactNode } from "react";

export type EvaluationTabKey = "self" | "peer" | "mentor" | "reference";

type TabStateMap<T> = Record<EvaluationTabKey, T>;

interface EvaluationContextProps {
  isComplete: boolean;
  isUpdate: boolean;
  setIsComplete: (value: boolean) => void;
  setIsUpdate: (value: boolean) => void;
  registerSubmitHandler: (key: string, handler: () => Promise<void>) => void;
  submitAll: () => Promise<void>;
  tabCompletion: TabStateMap<boolean>;
  updateTabCompletion: (key: EvaluationTabKey, value: boolean) => void;
  lastSubmittedAt: string | null;
  setLastSubmittedAt: (value: string | null) => void;
  isSubmit: boolean;
  setIsSubmit: (value: boolean) => void;
}

const EvaluationContext = createContext<EvaluationContextProps | undefined>(
  undefined
);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth(); // pega o token do usuário logado
  const [activeCycle, setActiveCycle] = useState<{ id: number } | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const [isSubmit, setIsSubmit] = useState(false);

  const [isComplete, setIsComplete] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const [initialTabCompletion, setInitialTabCompletion] = useState<
    TabStateMap<boolean>
  >({
    self: false,
    peer: false,
    mentor: false,
    reference: false,
  });

  const [tabCompletion, setTabCompletion] = useState<TabStateMap<boolean>>({
    self: false,
    peer: false,
    mentor: false,
    reference: false,
  });

  const submitAll = async () => {
    if (!activeCycle) throw new Error("Ciclo ativo não carregado");

    try {
      await submitEvaluation(activeCycle.id);

      const result = await submitEvaluation(activeCycle.id);

      setLastSubmittedAt(result.submittedAt);

      setIsComplete(true);
      setIsUpdate(false);
      setTabCompletion({
        self: true,
        peer: true,
        mentor: true,
        reference: true,
      });
    } catch (error) {
      console.error("Erro ao enviar avaliações:", error);
      throw error;
    }
  };

  const submitHandlers = useRef<Record<string, () => Promise<void>>>({});

  const registerSubmitHandler = (key: string, handler: () => Promise<void>) => {
    submitHandlers.current[key] = handler;
  };

  const updateTabCompletion = (key: EvaluationTabKey, value: boolean) => {
    setTabCompletion((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!token) return;

    const loadCompletionStatus = async () => {
      try {
        const cycle = await fetchActiveEvaluationCycle();
        setActiveCycle(cycle); // Salva ciclo ativo

        const statusResponse = await fetchEvaluationCompletionStatus(cycle.id);

        setInitialTabCompletion(statusResponse.completionStatus);
        setTabCompletion(statusResponse.completionStatus);
        setIsComplete(
          Object.values(statusResponse.completionStatus).every(Boolean)
        );
        setLastSubmittedAt(statusResponse.lastSubmittedAt || null);
        setIsSubmit(!!statusResponse.lastSubmittedAt); // true se já enviou
      } catch (error) {
        console.error("Erro ao carregar status da avaliação:", error);
      }
    };

    loadCompletionStatus();
  }, [token]);

  return (
    <EvaluationContext.Provider
      value={{
        isComplete,
        setIsComplete,
        isUpdate,
        setIsUpdate,
        registerSubmitHandler,
        submitAll,
        tabCompletion,
        updateTabCompletion,
        lastSubmittedAt,
        setLastSubmittedAt,
        isSubmit,
        setIsSubmit,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error("useEvaluation must be used within EvaluationProvider");
  }
  return context;
};
