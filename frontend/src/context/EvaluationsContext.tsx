import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

interface EvaluationContextProps {
  isComplete: boolean;
  isUpdate: boolean;
  setIsComplete: (value: boolean) => void;
  setIsUpdate: (value: boolean) => void;
  registerSubmitHandler: (key: string, handler: () => Promise<void>) => void;
  submitAll: () => Promise<void>;
  submitPeerEvaluations: (() => void) | null;
  setSubmitPeerEvaluations: (fn: (() => void) | null) => void;
}

const EvaluationContext = createContext<EvaluationContextProps | undefined>(undefined);

export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [submitPeerEvaluations, setSubmitPeerEvaluations] = useState<(() => void) | null>(null);

  const submitHandlers = useRef<Record<string, () => Promise<void>>>({});

  const registerSubmitHandler = (key: string, handler: () => Promise<void>) => {
    submitHandlers.current[key] = handler;
  };

  const submitAll = async () => {
    for (const handler of Object.values(submitHandlers.current)) {
      await handler();
    }
  };

  return (
    <EvaluationContext.Provider
      value={{
        isComplete,
        setIsComplete,
        isUpdate,
        setIsUpdate,
        registerSubmitHandler,
        submitAll,
        submitPeerEvaluations,
        setSubmitPeerEvaluations,
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
