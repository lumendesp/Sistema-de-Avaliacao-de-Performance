import { useEffect, useState } from "react";

interface Props {
  currentCycle: string;
  onChange: (cycleId: number, cycleName: string) => void;
}

interface Cycle {
  id: number;
  name: string;
}

const EvaluationCycleSelector = ({ currentCycle, onChange }: Props) => {
  const [cycles, setCycles] = useState<Cycle[]>([]);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await fetch("http://localhost:3000/evaluation-cycle/closed");
        const data = await res.json();
        setCycles(data);
      } catch (err) {
        console.error("Erro ao buscar ciclos fechados:", err);
      }
    };

    fetchCycles();
  }, []);

  return (
    <select
      defaultValue={currentCycle}
      className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700"
      onChange={(e) => {
        const selected = cycles.find(c => c.name === e.target.value);
        if (selected) onChange(selected.id, selected.name);
      }}
    >
      <option disabled value="">Selecione um ciclo</option>
      {cycles.map((cycle) => (
        <option key={cycle.id} value={cycle.name}>
          {cycle.name}
        </option>
      ))}
    </select>
  );
};

export default EvaluationCycleSelector;
