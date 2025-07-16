import React from "react";

interface RHCircularProgressCardProps {
  percentage: number;
  description: string;
  title?: string;
}

const RHCircularProgressCard: React.FC<RHCircularProgressCardProps> = ({
  percentage,
  description,
  title
}) => {
  const sqSize = 100;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-700">
          {title || "Preenchimento de Avaliação"}
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-[200px]">{description}</p>
      </div>
      <div className="relative" style={{ width: sqSize, height: sqSize }}>
        <svg width={sqSize} height={sqSize} viewBox={viewBox}>
          <circle
            className="stroke-current text-gray-200"
            cx={sqSize / 2}
            cy={sqSize / 2}
            r={radius}
            strokeWidth={`${strokeWidth}px`}
            fill="none"
          />
          <circle
            className="stroke-current text-green-500"
            strokeLinecap="round"
            strokeWidth={`${strokeWidth}px`}
            fill="none"
            transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
            cx={sqSize / 2}
            cy={sqSize / 2}
            r={radius}
            style={{
              strokeDasharray: dashArray,
              strokeDashoffset: dashOffset,
              transition: "stroke-dashoffset 0.5s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{`${percentage}%`}</span>
        </div>
      </div>
    </div>
  );
};

export default RHCircularProgressCard;
