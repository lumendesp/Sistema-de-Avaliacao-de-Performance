import { createContext, useContext, useRef, useState } from "react";
import {
  fetchEvaluationCompletionStatus,
  submitEvaluation,
  fetchActiveEvaluationCycle,
  unlockEvaluations,
} from "../services/api";
import { useAuth } from "./AuthContext";
import { useEffect } from "react";
import type { ReactNode } from "react";

export type EvaluationTabKey = "self" | "peer" | "mentor" | "reference";

type TabStateMap<T> = Record<EvaluationTabKey, T>;

interface EvaluationContextProps {
  isComplete: boolean;
  setIsComplete: (value: boolean) => void;
  registerSubmitHandler: (key: string, handler: () => Promise<void>) => void;
  submitAll: () => Promise<void>;
  tabCompletion: TabStateMap<boolean>;
  updateTabCompletion: (key: EvaluationTabKey, value: boolean) => void;
  lastSubmittedAt: string | null;
  setLastSubmittedAt: (value: string | null) => void;
  isSubmit: boolean;
  setIsSubmit: (value: boolean) => void;
  unlockAllEvaluations: () => Promise<void>;
  resetEvaluationContext: () => void;
  activeCycle: { id: number } | null;
  loadCompletionStatus: () => Promise<void>;
}

const EvaluationContext = createContext<EvaluationContextProps | undefined>(
  undefined
);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth(); // pega o token e usuário logado
  const [activeCycle, setActiveCycle] = useState<{ id: number } | null>(null);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const [isSubmit, setIsSubmit] = useState(false);

  const [isComplete, setIsComplete] = useState(false);

  const unlockAllEvaluations = async () => {
    if (!activeCycle) return;
    try {
      await unlockEvaluations(activeCycle.id);
      setIsSubmit(false);
    } catch (error) {
      console.error("Erro ao desbloquear avaliações:", error);
    }
  };

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
      const result = await submitEvaluation(activeCycle.id);

      setIsSubmit(true);
      setLastSubmittedAt(result.submittedAt);

      setIsComplete(true);
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

  const resetEvaluationContext = () => {
    setLastSubmittedAt(null);
    setIsSubmit(false);
    setIsComplete(false);
    setTabCompletion({
      self: false,
      peer: false,
      mentor: false,
      reference: false,
    });
  };

  const loadCompletionStatus = async () => {
    try {
      let role = "COLLABORATOR";
      if (user?.roles?.includes("COLLABORATOR")) role = "COLLABORATOR";
      else if (user?.roles?.includes("MANAGER")) role = "MANAGER";
      else if (user?.roles?.includes("COMMITTEE")) role = "COMMITTEE";
      else if (user?.roles?.includes("HR")) role = "HR";

      console.log("Usuário atual:", user);
      console.log("Role detectado:", role);

      const cycle = await fetchActiveEvaluationCycle(role);
      console.log("Cycle retornado:", cycle);

      setActiveCycle(cycle);

      if (!cycle) {
        console.warn(
          "Nenhum ciclo ativo retornado para o usuário e role informados."
        );
        return;
      }

      const statusResponse = await fetchEvaluationCompletionStatus(cycle.id);

      setInitialTabCompletion(statusResponse.completionStatus);
      setTabCompletion(statusResponse.completionStatus);
      setIsComplete(
        Object.values(statusResponse.completionStatus).every(Boolean)
      );
      setLastSubmittedAt(statusResponse.lastSubmittedAt || null);
      setIsSubmit(statusResponse.isSubmit);
    } catch (error) {
      console.error("Erro ao carregar status da avaliação:", error);
    }
  };

  useEffect(() => {
    console.log("useEffect disparado! token:", token, "user:", user);
    if (token && user) {
      resetEvaluationContext(); // Limpa o contexto ao trocar de usuário
      loadCompletionStatus();
    }
  }, [token, user]);
  // useEffect(() => {
  //   console.log("DEBUG => isSubmit:", isSubmit);
  //   console.log("DEBUG => tabCompletion:", tabCompletion);
  // }, [isSubmit, tabCompletion]);

  return (
    <EvaluationContext.Provider
      value={{
        isComplete,
        setIsComplete,
        registerSubmitHandler,
        submitAll,
        tabCompletion,
        updateTabCompletion,
        lastSubmittedAt,
        setLastSubmittedAt,
        isSubmit,
        setIsSubmit,
        unlockAllEvaluations,
        resetEvaluationContext,
        activeCycle,
        loadCompletionStatus,
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
