import { useEffect, useState } from "react";

interface Props {
  currentCycle: string;
  onChange: (cycleId: number, cycleName: string) => void;
}

interface Cycle {
  id: number;
  name: string;
  status: string;
}

const EvaluationCycleSelector = ({ currentCycle, onChange }: Props) => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3000/ciclos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          // Filtra para excluir ciclo com status IN_PROGRESS_COLLABORATOR
          const filtered = data.filter((c) => c.status !== "IN_PROGRESS_COLLABORATOR");
          setCycles(filtered);

          const match = filtered.find((c) => c.name === currentCycle);
          if (match) {
            setSelectedId(match.id);
          }
        } else {
          console.error("Resposta inesperada da API:", data);
          setCycles([]);
        }
      } catch (err) {
        console.error("Erro ao buscar ciclos:", err);
      }
    };

    fetchCycles();
  }, [currentCycle]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const selected = cycles.find((c) => c.id === id);
    if (selected) {
      setSelectedId(id);
      onChange(selected.id, selected.name);
    }
  };

  return (
    <div className="relative w-36">
      <select
        value={selectedId}
        onChange={handleChange}
        className="w-full appearance-none rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-gray-900 shadow-sm focus:border-green-main focus:outline-none focus:ring-1 focus:ring-green-main"
      >
        <option disabled value="">
          Selecione um ciclo
        </option>
        {cycles.map((cycle) => (
          <option key={cycle.id} value={cycle.id}>
            {cycle.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default EvaluationCycleSelector;
