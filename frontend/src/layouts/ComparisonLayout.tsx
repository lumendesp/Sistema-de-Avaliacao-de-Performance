import { useEffect, useState } from "react";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import EvaluationCycleSelector from "../components/ComparisonEvaluationForm/EvaluationCycleSelector";

const tabs = [
  { label: "Autoavaliação", path: "/collaborator/evaluation-comparison" },
  { label: "Avaliação 360", path: "/collaborator/evaluation-comparison/peer-evaluation" },
  { label: "Mentoria", path: "/collaborator/evaluation-comparison/mentor-evaluation" },
  { label: "Referências", path: "/collaborator/evaluation-comparison/reference-evaluation" },
];

const ComparisonLayout = () => {
  const location = useLocation();
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedCycleName, setSelectedCycleName] = useState<string>("");

  // ao entrar na página, pega o ciclo do location.state se houver
  useEffect(() => {
    const state = location.state as { selectedCycleName?: string };

    if (state?.selectedCycleName) {
      setSelectedCycleName(state.selectedCycleName);

      // Buscar o ID correspondente ao nome do ciclo
      const fetchCycleIdByName = async () => {
        const token = localStorage.getItem("token");

        try {
          const res = await fetch("http://localhost:3000/evaluation-cycle/closed", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          const matched = data.find((cycle: any) => cycle.name === state.selectedCycleName);
          if (matched) {
            setSelectedCycleId(matched.id);
          }
        } catch (err) {
          console.error("Erro ao buscar ciclos fechados:", err);
        }
      };

      fetchCycleIdByName();
    }
  }, [location.state]);

  const handleCycleChange = (id: number, name: string) => {
    setSelectedCycleId(id);
    setSelectedCycleName(name);
  };

  return (
    <div className="pt-6">
      <div className="p-6 pb-0 m-0">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {selectedCycleName ? `Ciclo ${selectedCycleName}` : "Selecione um ciclo"}
          </h1>
          <EvaluationCycleSelector currentCycle={selectedCycleName} onChange={handleCycleChange} />
        </header>
        <nav className="flex gap-20 pt-16 m-0 pl-10">
          {tabs.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/collaborator/evaluation-comparison"}
              className={({ isActive }) =>
                isActive
                  ? "text-md font-bold text-green-main border-b-2 border-green-main pb-1"
                  : "text-md font-medium text-black pb-1"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet context={{ selectedCycleId, selectedCycleName }} />
    </div>
  );
};

export default ComparisonLayout;
