interface ScoreBoxComparisonProps {
  score?: number;
  type: "self-box" | "final-box" | "self-text" | "final-text";
}

const ScoreBoxComparison = ({ score, type }: ScoreBoxComparisonProps) => {
  let bg = "#E6E6E6";
  let color = "#1D1D1D";

  if (type === "self-box") {
    bg = "#E6E6E6";
    color = "#08605F";
  } else if (type === "final-box") {
    bg = '#08605F';
    color = "#FFFFFF";
  } else if (type === "final-text") {
    bg = "#E6E6E6";
    color = "#08605F";
  }

  return (
    <div
      className={`w-[37px] h-[25px] rounded-[4px] flex items-center justify-center text-sm font-bold`}
      style={{ backgroundColor: bg, color }}
    >
      {score ?? "-"}
    </div>
  );
};

export default ScoreBoxComparison;
