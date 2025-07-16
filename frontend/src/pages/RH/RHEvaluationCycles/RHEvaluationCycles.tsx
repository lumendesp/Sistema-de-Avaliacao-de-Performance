import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoAddCircle,
  IoCloseCircle,
  IoArrowRedoCircle,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { getEvaluationCycles } from "../../../services/api";
import type { EvaluationCycle } from "../../../types/rh";

const statusMap: Record<string, { label: string; color: string; bg: string }> =
  {
    IN_PROGRESS_COLLABORATOR: {
      label: "Em andamento (Colaborador)",
      color: "text-blue-800",
      bg: "bg-blue-100",
    },
    IN_PROGRESS_MANAGER: {
      label: "Em andamento (Gestor)",
      color: "text-purple-800",
      bg: "bg-purple-100",
    },
    IN_PROGRESS_COMMITTEE: {
      label: "Em andamento (Comitê)",
      color: "text-yellow-800",
      bg: "bg-yellow-100",
    },
    CLOSED: {
      label: "Fechado",
      color: "text-gray-700",
      bg: "bg-gray-200",
    },
    PUBLISHED: {
      label: "Publicado",
      color: "text-green-800",
      bg: "bg-green-100",
    },
  };

const actionMap: Record<
  string,
  { label: string; endpoint: string; method: string }
> = {
  IN_PROGRESS_COLLABORATOR: {
    label: "Encerrar ciclo de colaborador",
    endpoint: "/ciclos/close-collaborator",
    method: "PATCH",
  },
  IN_PROGRESS_MANAGER: {
    label: "Encerrar ciclo de gestor",
    endpoint: "/ciclos/close-manager",
    method: "PATCH",
  },
  CLOSED: {
    label: "Abrir para comitê",
    endpoint: "/ciclos/open-committee",
    method: "PATCH",
  },
  IN_PROGRESS_COMMITTEE: {
    label: "Publicar ciclo",
    endpoint: "/ciclos/close-committee",
    method: "PATCH",
  },
};

const actionIconMap: Record<string, { icon: JSX.Element; tooltip: string }> = {
  IN_PROGRESS_COLLABORATOR: {
    icon: (
      <IoCloseCircle
        size={28}
        className="text-blue-700 hover:text-blue-900 transition"
      />
    ),
    tooltip: "Encerrar ciclo de colaborador",
  },
  IN_PROGRESS_MANAGER: {
    icon: (
      <IoCloseCircle
        size={28}
        className="text-purple-700 hover:text-purple-900 transition"
      />
    ),
    tooltip: "Encerrar ciclo de gestor",
  },
  CLOSED: {
    icon: (
      <IoArrowRedoCircle
        size={28}
        className="text-gray-700 hover:text-yellow-700 transition"
      />
    ),
    tooltip: "Abrir para comitê",
  },
  IN_PROGRESS_COMMITTEE: {
    icon: (
      <IoCheckmarkCircle
        size={28}
        className="text-yellow-700 hover:text-green-700 transition"
      />
    ),
    tooltip: "Publicar ciclo",
  },
};

const RHEvaluationCycles = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [allCycles, setAllCycles] = useState<EvaluationCycle[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const cycle =
    allCycles
      .filter((c) => c.status !== "PUBLISHED")
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )[0] || null;

  const reloadCycles = async () => {
    setLoading(true);
    try {
      const cycles = await getEvaluationCycles();
      setAllCycles(Array.isArray(cycles) ? cycles : []);
    } catch {
      setAllCycles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadCycles();
  }, []);

  const handleAction = async (status: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    const action = actionMap[status];
    if (!action || !cycle) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000${action.endpoint}`, {
        method: action.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Erro ao executar ação");
      }
      setActionSuccess("Ação realizada com sucesso!");
      const updatedStatus =
        status === "IN_PROGRESS_COLLABORATOR"
          ? "IN_PROGRESS_MANAGER"
          : status === "IN_PROGRESS_MANAGER"
          ? "CLOSED"
          : status === "CLOSED"
          ? "IN_PROGRESS_COMMITTEE"
          : status === "IN_PROGRESS_COMMITTEE"
          ? "PUBLISHED"
          : status;
      const updatedCycle = { ...cycle, status: updatedStatus };
      setAllCycles((prev) =>
        prev.map((c) =>
          c.id === cycle.id ? { ...c, status: updatedStatus } : c
        )
      );
    } catch (err: any) {
      setActionError(err.message || "Erro ao executar ação");
      await reloadCycles();
    } finally {
      setActionLoading(false);
      setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-0">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ciclos Avaliativos</h1>
        <div className="w-12 h-12 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold text-lg">
          RH
        </div>
      </header>
      <section className="bg-white rounded-2xl shadow-lg p-8 flex flex-col space-y-8 overflow-hidden w-full">
        <div className="flex-1">
          {loading ? (
            <div className="text-center text-gray-500">Carregando...</div>
          ) : !cycle ? (
            <>
              
            </>
          ) : (
            <div className="text-center text-green-700 text-lg font-semibold mb-8">
              Ciclo ativo:{" "}
              <span className="font-bold text-green-900">{cycle.name}</span>
            </div>
          )}
          <div className="flex-1 flex flex-col h-full w-full p-0 m-0">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Todos os ciclos
            </h2>
            <div className="flex-1 w-full rounded-xl scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent p-0 m-0">
              {/* Cabeçalho das colunas */}
              <div className="hidden md:grid grid-cols-5 gap-2 px-2 py-2 bg-gray-100 rounded-t-xl text-xs font-semibold text-gray-600 uppercase tracking-wider text-center items-center">
                <div>Nome</div>
                <div>Status</div>
                <div>Início</div>
                <div>Término</div>
                <div className="text-center">Ação</div>
              </div>
              <div className="md:hidden flex gap-2 px-2 py-2 bg-gray-100 rounded-t-xl text-xs font-semibold text-gray-600 uppercase tracking-wider items-center">
                <div className="flex-1">Ciclo</div>
                <div className="w-20 text-center">Ação</div>
              </div>
              <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-b-xl shadow">
                {allCycles.length === 0 && (
                  <div className="text-gray-500 py-6 text-center col-span-5">
                    Nenhum ciclo encontrado.
                  </div>
                )}
                {allCycles.map((c) => {
                  const status = statusMap[c.status] || {
                    label: c.status,
                    color: "text-gray-700",
                    bg: "bg-gray-100",
                  };
                  const isActive = cycle && c.id === cycle.id;
                  const action = actionMap[c.status];
                  const iconData = actionIconMap[c.status];
                  return (
                    <div
                      key={c.id}
                      className="grid grid-cols-1 md:grid-cols-5 gap-2 px-2 py-3 items-center md:text-center"
                    >
                      <div className="font-medium text-gray-800 md:truncate h-full flex items-center text-center min-h-[32px]">
                        <span className="block md:inline align-middle w-full">
                          {c.name}
                        </span>
                        <span className="md:hidden block text-xs mt-1 w-full">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
                          >
                            {status.label}
                          </span>
                          <span className="block text-gray-600 mt-1">
                            Início:{" "}
                            {c.startDate
                              ? new Date(c.startDate).toLocaleDateString(
                                  "pt-BR"
                                )
                              : "-"}
                          </span>
                          <span className="block text-gray-600">
                            Término:{" "}
                            {c.endDate
                              ? new Date(c.endDate).toLocaleDateString("pt-BR")
                              : "-"}
                          </span>
                        </span>
                      </div>
                      <div className="hidden md:flex justify-center items-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="hidden md:flex justify-center items-center text-gray-600">
                        {c.startDate
                          ? new Date(c.startDate).toLocaleDateString("pt-BR")
                          : "-"}
                      </div>
                      <div className="hidden md:flex justify-center items-center text-gray-600">
                        {c.endDate
                          ? new Date(c.endDate).toLocaleDateString("pt-BR")
                          : "-"}
                      </div>
                      <div className="flex justify-center items-center">
                        {isActive && action && iconData ? (
                          <button
                            className="group relative"
                            onClick={() => handleAction(c.status)}
                            disabled={actionLoading}
                          >
                            <span className="sr-only">{iconData.tooltip}</span>
                            {actionLoading ? (
                              <svg
                                className="animate-spin h-7 w-7 text-gray-400"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                />
                              </svg>
                            ) : (
                              iconData.icon
                            )}
                            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                              {iconData.tooltip}
                            </span>
                          </button>
                        ) : c.status === "PUBLISHED" ? (
                          <span className="text-green-700 font-semibold text-xs">
                            Publicado
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {!cycle && !loading && !location.pathname.endsWith("/create") && (
        <div className="w-full flex flex-col items-center justify-center bg-gray-50 rounded-xl shadow-lg p-8 mt-4">
          <p className="text-lg text-gray-700 mb-4 text-center">
            Nenhum ciclo avaliativo está aberto no momento.
            <br />
            Crie um novo ciclo para iniciar o processo de avaliação dos
            colaboradores.
          </p>
          <button
            className="flex items-center gap-2 bg-[#08605F] text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-opacity-90 transition-colors mt-2 shadow"
            onClick={() => navigate("create")}
          >
            <IoAddCircle size={24} /> Novo Ciclo Avaliativo
          </button>
        </div>
      )}
    </div>
  );
};

export default RHEvaluationCycles;
