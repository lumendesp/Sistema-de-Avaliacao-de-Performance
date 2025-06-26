import type { SubmitEvaluationButtonProps } from "../../types/submitButton";

const SubmitButton = ({
  isComplete,
  onClick,
  isUpdate = false,
  disabled = false,
}: SubmitEvaluationButtonProps) => {
  const isDisabled = disabled || !isComplete;

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded transition font-bold
        ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-main text-white hover:bg-gray-main"
        }`}
    >
      {isUpdate ? "Atualizar avaliação" : "Concluir e enviar"}
    </button>
  );
};

export default SubmitButton;
