import React, { useEffect, useState } from "react";
import { API_URL } from '../../services/api';
import { useNavigate } from "react-router-dom";

const statusStyles: Record<string, string> = {
  "Em andamento": "bg-yellow-100 text-yellow-800",
  "Finalizado": "bg-green-100 text-green-800",
  "Pendente": "bg-red-100 text-red-700",
};

interface Collaborator {
  id: number;
  name: string;
  unit?: { name: string };
  position?: { name: string };
  finalScores: any[];
  selfEvaluations: any[];
  managerEvaluationsReceived: any[];
}

const ColaboradoresList: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch(`${API_URL}/users/collaborators/dashboard`);
        if (!res.ok) throw new Error('Erro ao buscar colaboradores');
        const colaboradores = await res.json();
        setColaboradores(colaboradores);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchColaboradores();
  }, []);

  const getCollaboratorStatus = (collaborator: Collaborator) => {
    const managerEvals = collaborator.managerEvaluationsReceived || [];
    if (managerEvals.length === 0) return "Pendente";
    // Pega a avaliação do gestor mais recente
    const latestManagerEval = managerEvals[managerEvals.length - 1];
    const allCriteria = (latestManagerEval.items || []);
    if (allCriteria.length === 0) return "Pendente";
    // Critérios com nota preenchida
    const withScore = allCriteria.filter((c: any) => c.score !== null && c.score !== undefined);
    // Critérios com nota E justificativa preenchidas
    const filled = allCriteria.filter((c: any) =>
      c.score !== null && c.score !== undefined && c.justification && c.justification.trim() !== ""
    );
    if (withScore.length === 0) return "Pendente";
    if (filled.length < allCriteria.length) return "Em andamento";
    return "Finalizado";
  };

  const getSelfScore = (collaborator: Collaborator) => {
    if (!collaborator.selfEvaluations || collaborator.selfEvaluations.length === 0) {
      return "-";
    }
    
    // Pega a autoavaliação mais recente
    const latestSelfEval = collaborator.selfEvaluations[collaborator.selfEvaluations.length - 1];
    if (latestSelfEval.items && latestSelfEval.items.length > 0) {
      const avgScore = latestSelfEval.items.reduce((sum: number, item: any) => sum + item.score, 0) / latestSelfEval.items.length;
      return avgScore.toFixed(1);
    }
    return "-";
  };

  const getManagerScore = (collaborator: Collaborator) => {
    if (!collaborator.managerEvaluationsReceived || collaborator.managerEvaluationsReceived.length === 0) {
      return "-";
    }
    
    // Pega a avaliação do gestor mais recente
    const latestManagerEval = collaborator.managerEvaluationsReceived[collaborator.managerEvaluationsReceived.length - 1];
    if (latestManagerEval.items && latestManagerEval.items.length > 0) {
      const avgScore = latestManagerEval.items.reduce((sum: number, item: any) => sum + item.score, 0) / latestManagerEval.items.length;
      return avgScore.toFixed(1);
    }
    return "-";
  };

  if (loading) return <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-7xl mx-auto">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">Colaboradores</h2>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  </div>;
  
  if (error) return <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-7xl mx-auto">
    <div className="text-red-600">Erro: {error}</div>
  </div>;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Colaboradores</h2>
        <a
          href="/manager/collaborators"
          className="text-sm text-teal-700 font-medium hover:underline"
        >
          Ver mais
        </a>
      </div>
      <div className="space-y-4">
        {colaboradores.map((colab, idx) => {
          const status = getCollaboratorStatus(colab);
          const selfScore = getSelfScore(colab);
          const managerScore = getManagerScore(colab);
          
          return (
            <button
              key={colab.id || idx}
              className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
              onClick={() => navigate(`/manager/avaliacao/${colab.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg">
                  {colab.name ? colab.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'C'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 leading-tight">
                    {colab.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {colab.unit?.name || colab.position?.name || 'Departamento'}
                  </div>
                </div>
                <span className={`ml-4 px-2 py-0.5 rounded text-xs font-medium ${statusStyles[status]}`}>
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-xs text-gray-500">
                  Autoavaliação <span className="ml-1 font-semibold text-gray-900">{selfScore}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Nota gestor <span className="ml-1 font-semibold text-gray-900">{managerScore}</span>
                </div>
                <span className="ml-2 text-gray-400 hover:text-teal-700">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColaboradoresList;
