import { NavLink, Outlet } from "react-router-dom";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { useEvaluation } from "../context/EvaluationsContext";

// Tabs que representam os diferentes formulários de avaliação
const tabs = [
  { label: "Autoavaliação", path: "self-evaluation" },
  { label: "Avaliação 360", path: "peer-evaluation" },
  { label: "Mentoria", path: "mentor-evaluation" },
  { label: "Referências", path: "reference-evaluation" },
];

const EvaluationLayout = () => {
  // Pegando do contexto: se está completo, se é atualização e a função de submitAll
  const { isComplete, submitAll, isUpdate } = useEvaluation();

  return (
    <div className="pt-6">
      <div className="p-6 pb-0 m-0">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Ciclo 2025.1</h1>

          {/* Botão para submeter todos os formulários cadastrados (autoavaliação, 360, etc) */}
          <SubmitButton
            isComplete={isComplete}
            isUpdate={isUpdate}
            onClick={submitAll}
          />
        </header>

        {/* Menu de navegação entre os formulários */}
        <nav className="flex gap-20 pt-16 m-0 pl-10">
          {tabs.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
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

      {/* Onde cada formulário vai ser carregado conforme a aba selecionada */}
      <Outlet />
    </div>
  );
};

export default EvaluationLayout;
