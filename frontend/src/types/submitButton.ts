export interface SubmitEvaluationButtonProps {
  isComplete: boolean;
  isUpdate?: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}