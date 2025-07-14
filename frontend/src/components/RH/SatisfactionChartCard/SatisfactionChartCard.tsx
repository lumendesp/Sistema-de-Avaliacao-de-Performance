import React from "react";
import RHSurveyBarChart from "../RHSurveyBarChart/RHSurveyBarChart";

interface SatisfactionChartCardProps {
  title: string;
  chartData: any;
}

const SatisfactionChartCard: React.FC<SatisfactionChartCardProps> = ({
  title,
  chartData,
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="h-[320px] relative">
        <RHSurveyBarChart chartData={chartData} />
      </div>
    </>
  );
};

export default SatisfactionChartCard;
