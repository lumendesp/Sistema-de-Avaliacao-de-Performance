import type { ScoreBoxProps } from "../../types/scoreBox";

const getEvaluationBgClass = (nota?: number): string => {
  if (nota === undefined) return 'bg-gray-300';
  if (nota >= 4.5) return 'bg-green-800';
  if (nota >= 4.0) return 'bg-teal-600';
  if (nota >= 3.0) return 'bg-yellow-600';
  return 'bg-red-600';
};

const ColoredScoreBox = ({ score }: ScoreBoxProps) => {
  const bgClass = getEvaluationBgClass(score);

  return (
    <div
      className={`w-[37px] h-[25px] rounded-[4px] flex items-center justify-center text-sm font-bold text-white ${bgClass}`}
    >
      {score !== undefined && score !== null ? score.toFixed(1) : '-'}
    </div>
  );
};

export default ColoredScoreBox;
