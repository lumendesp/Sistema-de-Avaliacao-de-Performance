import { NavLink, Outlet } from "react-router-dom";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { useEvaluation } from "../context/EvaluationsContext";

import { useEffect } from "react";

const tabs = [
  { key: "self", label: "Autoavaliação", path: "self-evaluation" },
  { key: "peer", label: "Avaliação 360", path: "peer-evaluation" },
  { key: "mentor", label: "Mentoria", path: "mentor-evaluation" },
  { key: "reference", label: "Referências", path: "reference-evaluation" },
] as const;

const EvaluationLayout = () => {
  const { isComplete, isUpdate, submitAll, tabCompletion, lastSubmittedAt, isSubmit, setIsSubmit, setLastSubmittedAt } =
    useEvaluation();

  const isButtonDisabled =
    !Object.values(tabCompletion).every(Boolean) || !!lastSubmittedAt;

  useEffect(() => {
    console.log("Estado das abas:", tabCompletion);
  }, [tabCompletion]);

  return (
    <div className="pt-6">
      <div className="p-6 pb-0 m-0">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Ciclo 2025.1</h1>
          <div className="flex justify-center items-center gap-5">
            {lastSubmittedAt && (
              <span className="text-sm text-gray-600">
                Último envio: {new Date(lastSubmittedAt).toLocaleString()}
              </span>
            )}
            <SubmitButton
              isComplete={Object.values(tabCompletion).every(Boolean)}
              onClick={async () => {
                if (isSubmit) {
                  setIsSubmit(false);
                  setLastSubmittedAt(null);
                } else {
                  await submitAll();
                  setIsSubmit(true);
                }
              }}
              disabled={
                !isSubmit && !Object.values(tabCompletion).every(Boolean)
              }
              label={isSubmit ? "Editar avaliações" : "Concluir e enviar"}
            />
          </div>
        </header>

        <nav className="flex gap-20 pt-16 m-0 pl-10">
          {tabs.map(({ key, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                (isActive
                  ? "text-md font-bold text-green-main border-b-2 border-green-main"
                  : "text-md font-medium text-black") +
                " pb-1 flex items-center gap-2"
              }
            >
              <span>{label}</span>
              {!tabCompletion[key] && (
                <span
                  className="w-2 h-2 rounded-full bg-red-500"
                  title="Aba incompleta"
                />
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
};

export default EvaluationLayout;
