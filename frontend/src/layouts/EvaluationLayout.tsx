import { NavLink, Outlet } from "react-router-dom";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { useEvaluation } from "../context/EvaluationsContext";

const tabs = [
  { key: "self", label: "Autoavaliação", path: "self-evaluation" },
  { key: "peer", label: "Avaliação 360", path: "peer-evaluation" },
  { key: "mentor", label: "Mentoria", path: "mentor-evaluation" },
  { key: "reference", label: "Referências", path: "reference-evaluation" },
] as const;

const EvaluationLayout = () => {
  const {
    submitAll,
    tabCompletion,
    lastSubmittedAt,
    isSubmit,
    unlockAllEvaluations,
    activeCycle,
  } = useEvaluation();

  return (
    <div className="h-full flex flex-col pt-12 sm:pt-6">
      <div className="p-3 md:p-6 md:pb-0 pb-0 m-0">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Ciclo {activeCycle?.name ?? "Indefinido"}
          </h1>
          <div className="flex flex-col-reverse items-end md:items-center md:flex-row gap-2 md:gap-5">
            {lastSubmittedAt && isSubmit && (
              <span className="text-xs sm:text-sm text-gray-600">
                Último envio: {new Date(lastSubmittedAt).toLocaleString()}
              </span>
            )}
            <SubmitButton
              key={isSubmit ? "edit-mode" : "submit-mode"}
              isComplete={Object.values(tabCompletion).every(Boolean)}
              onClick={async () => {
                if (isSubmit) {
                  await unlockAllEvaluations();
                } else {
                  await submitAll();
                }
              }}
              label={isSubmit ? "Editar avaliações" : "Concluir e enviar"}
            />
          </div>
        </header>

        <nav className="overflow-x-auto">
          <div className="flex gap-7 sm:gap-10 px-4 sm:px-10 pt-8 sm:pt-12 whitespace-nowrap">
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
                {!tabCompletion[key] && activeCycle && (
                  <span
                    className="w-2 h-2 rounded-full bg-red-500"
                    title="Aba incompleta"
                  />
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      <Outlet />
    </div>
  );
};

export default EvaluationLayout;
