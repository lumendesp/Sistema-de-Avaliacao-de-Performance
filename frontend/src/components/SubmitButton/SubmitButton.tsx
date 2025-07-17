import type { SubmitEvaluationButtonProps } from "../../types/submitButton";

const SubmitButton = ({
  isComplete,
  onClick,
  label
}: SubmitEvaluationButtonProps) => {

  return (
    <button
      disabled={!isComplete}
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded transition font-bold
        ${
          !isComplete
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-main text-white hover:bg-gray-main"
        }`}
    >
      {label}
    </button>
  );
};

export default SubmitButton;
