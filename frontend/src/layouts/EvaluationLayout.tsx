import { NavLink, Outlet } from "react-router-dom";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { useEvaluation } from "../context/EvaluationsContext";

import { useEffect } from "react";

const tabs = [
  { label: "Autoavaliação", path: "self-evaluation" },
  { label: "Avaliação 360", path: "peer-evaluation" },
  { label: "Mentoria", path: "mentor-evaluation" },
  { label: "Referências", path: "reference-evaluation" },
];

const EvaluationLayout = () => {
  const { isComplete, isUpdate, submitAll, tabCompletion } = useEvaluation();

  useEffect(() => {
    console.log("Estado das abas:", tabCompletion);
  }, [tabCompletion]);

  return (
    <div className="pt-6">
      <div className="p-6 pb-0 m-0">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Ciclo 2025.1</h1>
          <SubmitButton
            isComplete={Object.values(tabCompletion).every(Boolean)}
            isUpdate={isUpdate}
            onClick={submitAll}
            disabled={!Object.values(tabCompletion).every(Boolean)}
          />
        </header>

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

      <Outlet />
    </div>
  );
};

export default EvaluationLayout;
