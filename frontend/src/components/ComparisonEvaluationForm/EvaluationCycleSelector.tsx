const EvaluationCycleSelector = ({ currentCycle }: { currentCycle: string }) => {
  return (
    <select
      defaultValue={currentCycle}
      className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700"
    >
      <option value="2024.2">2024.2</option>
      <option value="2024.1">2024.1</option>
      <option value="2023.2">2023.2</option>
    </select>
  );
};

export default EvaluationCycleSelector;
