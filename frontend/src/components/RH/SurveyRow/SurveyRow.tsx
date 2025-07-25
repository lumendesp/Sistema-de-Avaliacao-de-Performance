import React from "react";
import SurveyStatusBadge from "../SurveyStatusBadge/SurveyStatusBadge";
import type { SurveyStatus } from "../../../types/surveyStatus";

interface SurveyRowProps {
  id?: number;
  title: string;
  date: string;
  status: SurveyStatus;
  onClick?: () => void;
}

const SurveyRow: React.FC<SurveyRowProps> = ({
  id,
  title,
  date,
  status,
  onClick,
}) => {
  return (
    <div
      className={`flex items-center p-3 rounded-lg hover:bg-gray-50 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <SurveyStatusBadge status={status} />
    </div>
  );
};

export default SurveyRow;
