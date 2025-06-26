import type { SubmitEvaluationButtonProps } from "../../types/submitButton";

const SubmitButton = ({ isComplete, onClick, isUpdate = false }: SubmitEvaluationButtonProps) => {
  return (
    <button
      disabled={!isComplete}
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded transition 
        ${
          isComplete
            ? "bg-green-main text-white hover:bg-gray-main font-bold"
            : "bg-green-main bg-opacity-40 text-white cursor-not-allowed font-bold"
        }`}
    >
      {isUpdate ? "Atualizar avaliação" : "Concluir e enviar"}
    </button>
  );
};

export default SubmitButton;
    