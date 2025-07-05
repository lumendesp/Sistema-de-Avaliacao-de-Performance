import { NavLink, Outlet, useLocation } from "react-router-dom";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { useEvaluation } from "../context/EvaluationsContext";

const tabs = [
  { label: "Autoavaliação", path: "self-evaluation" },
  { label: "Avaliação 360", path: "peer-evaluation" },
  { label: "Mentoria", path: "mentor-evaluation" },
  { label: "Referências", path: "reference-evaluation" },
];

const EvaluationLayout = () => {
  const {
    isComplete,
    isUpdate,
    submitAll,
    submitPeerEvaluations,
  } = useEvaluation();
  const location = useLocation();

  const isSelfEvaluation = location.pathname.endsWith("/self-evaluation");
  const isPeerEvaluation = location.pathname.endsWith("/peer-evaluation");
  const isReferenceEvaluation = location.pathname.endsWith("/reference-evaluation");
  const isMentorEvaluation = location.pathname.endsWith("/mentor-evaluation");

  return (
    <div className="pt-6">
      <div className="p-6 pb-0 m-0">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Ciclo 2025.1</h1>

          {isSelfEvaluation ? (
            <SubmitButton
              isComplete={isComplete}
              isUpdate={isUpdate}
              onClick={submitAll}
              disabled={!isComplete}
            />
          ) : isPeerEvaluation ? (
            <button
              onClick={submitAll}
              className="bg-green-main text-white rounded px-4 py-2 text-sm hover:opacity-90 transition"
            >
              Enviar avaliações 360°
            </button>
          ) : isReferenceEvaluation ? (
            <button
              onClick={submitAll}
              className="bg-green-main text-white rounded px-4 py-2 text-sm hover:opacity-90 transition"
            >
              Enviar referências
            </button>
          ) : isMentorEvaluation ? (
            <button
              onClick={submitAll}
              className="bg-green-main text-white rounded px-4 py-2 text-sm hover:opacity-90 transition"
            >
              Enviar avaliação de mentoria
            </button>
          ) : null}
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
