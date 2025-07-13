import React from "react";
import { BiCalendar } from "react-icons/bi";

interface RHColoredMetricCardProps {
  title: string;
  description: string;
  value: number;
  unit?: string;
}

const RHColoredMetricCard: React.FC<RHColoredMetricCardProps> = ({
  title,
  description,
  value,
  unit,
}) => {
  const colorClass =
    value < 4
      ? "text-red-600"
      : value <= 7
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-[270px]">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-1 ml-4">
        <div className="rounded-full">
          <BiCalendar size={50} className={`${colorClass}`} />
        </div>
        <div className="flex flex-col justify-center items-center">
          <span className={`text-4xl font-bold ${colorClass}`}>{value}</span>
          {unit && <span className={`text-lg ml-1 ${colorClass}`}>{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default RHColoredMetricCard;
