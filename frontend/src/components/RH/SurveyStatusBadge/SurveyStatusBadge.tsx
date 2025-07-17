import type { SurveyStatus } from "../../../types/surveyStatus";

interface SurveyStatusBadgeProps {
  status: SurveyStatus;
}

const surveyColors = {
  aberta: "bg-green-100 text-green-700",
  fechada: "bg-gray-200 text-gray-600",
};

const SurveyStatusBadge: React.FC<SurveyStatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold inline-flex items-center justify-center w-20 h-6 rounded-full ${surveyColors[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default SurveyStatusBadge;
