import { createContext, useContext, useRef, useState } from "react";
import {
  fetchEvaluationCompletionStatus,
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
}

const EvaluationContext = createContext<EvaluationContextProps | undefined>(
  undefined
);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth(); // pega o token do usuário logado

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

  const submitHandlers = useRef<Record<string, () => Promise<void>>>({});

  const registerSubmitHandler = (key: string, handler: () => Promise<void>) => {
    submitHandlers.current[key] = handler;
  };

  const submitAll = async () => {
    for (const handler of Object.values(submitHandlers.current)) {
      await handler();
    }
  };

  const updateTabCompletion = (key: EvaluationTabKey, value: boolean) => {
    setTabCompletion((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!token) return;

    const loadCompletionStatus = async () => {
      try {
        const activeCycle = await fetchActiveEvaluationCycle(); 
        const status = await fetchEvaluationCompletionStatus(activeCycle.id);
        setInitialTabCompletion(status);
        setTabCompletion(status);
        setIsComplete(Object.values(status).every(Boolean));
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
