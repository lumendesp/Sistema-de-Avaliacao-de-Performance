import React from "react";
import RHSurveyBarChart from "../RHSurveyBarChart/RHSurveyBarChart";

interface SatisfactionChartCardProps {
  title: string;
  selectedYear: string;
  onYearChange: (year: string) => void;
  chartData: any;
  availableYears: string[];
}

const SatisfactionChartCard: React.FC<SatisfactionChartCardProps> = ({
  title,
  selectedYear,
  onYearChange,
  chartData,
  availableYears,
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <select
          className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
        >
          {availableYears.map((year) => (
            <option key={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="h-[320px] relative">
        <RHSurveyBarChart chartData={chartData} />
      </div>
    </>
  );
};

export default SatisfactionChartCard;
