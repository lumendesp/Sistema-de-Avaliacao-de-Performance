import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

// Interface do contexto que define tudo que pode ser acessado globalmente nos formulários de avaliação
interface EvaluationContextProps {
  // Indica se o formulário atual está completamente preenchido
  isComplete: boolean;

  // Indica se a avaliação está sendo atualizada (true) ou criada (false)
  isUpdate: boolean;

  // Função para atualizar o estado de preenchimento
  setIsComplete: (value: boolean) => void;

  // Função para definir se é uma atualização
  setIsUpdate: (value: boolean) => void;

  // Registro de função de envio para um formulário específico (ex: "self-evaluation")
  registerSubmitHandler: (key: string, handler: () => Promise<void>) => void;

  // Função que dispara o envio de todos os formulários registrados
  submitAll: () => Promise<void>;
}

// Criação do contexto em si
const EvaluationContext = createContext<EvaluationContextProps | undefined>(undefined);

// Componente provider que envolve o app e disponibiliza os dados acima
export const EvaluationProvider = ({ children }: { children: ReactNode }) => {
  const [isComplete, setIsComplete] = useState(false); // Estado global de preenchimento
  const [isUpdate, setIsUpdate] = useState(false);     // Estado global se é atualização ou novo envio

  // Guarda as funções de envio registradas por tipo de formulário
  const submitHandlers = useRef<Record<string, () => Promise<void>>>({});

  // Registra a função de submit para um formulário específico
  const registerSubmitHandler = (key: string, handler: () => Promise<void>) => {
    submitHandlers.current[key] = handler;
  };

  // Envia todos os formulários registrados
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
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

// Hook customizado para acessar o contexto facilmente nos componentes
export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error("useEvaluation must be used within EvaluationProvider");
  }
  return context;
};
