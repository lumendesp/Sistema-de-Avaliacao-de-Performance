import type { ScoreBoxProps } from "../types/scoreBox";

const ScoreBox = ({ score }: ScoreBoxProps) => {
  return (
    <div
      className="w-[37px] h-[25px] rounded-[4px] flex items-center justify-center text-sm bg-[#E6E6E6] text-[#1D1D1D] font-bold"
    >
      {score ? score : '-'}
    </div>
  );
};

export default ScoreBox;