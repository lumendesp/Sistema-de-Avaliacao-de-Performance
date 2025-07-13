import React from "react";
import { BsEmojiAngry } from "react-icons/bs";
import { BsEmojiNeutral } from "react-icons/bs";
import { BsEmojiSmile } from "react-icons/bs";

interface RHClimateMetricCardProps {
  title: string;
  description?: string;
  value: number;
}

const RHClimateMetricCard: React.FC<RHClimateMetricCardProps> = ({
  title,
  description,
  value,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          <div
            className={`h-10 w-1 rounded-md ${
              value < 40
                ? "bg-red-600"
                : value <= 70
                ? "bg-yellow-600"
                : "bg-green-600"
            }`}
          ></div>
          {description && (
            <p className="text-xs text-gray-600 mt-1 max-w-[340px]">
              {description}
            </p>
          )}
        </div>
      </div>
      {value < 40 ? (
        <div className="p-3 rounded-full bg-red-100">
          <BsEmojiAngry className="h-8 w-8 text-red-600" />
        </div>
      ) : value <= 70 ? (
        <div className="p-3 rounded-full bg-yellow-100">
          <BsEmojiNeutral className="h-8 w-8 text-yellow-600" />
        </div>
      ) : (
        <div className="p-3 rounded-full bg-green-100">
          <BsEmojiSmile className="h-8 w-8 text-green-600" />
        </div>
      )}
    </div>
  );
};

export default RHClimateMetricCard;
