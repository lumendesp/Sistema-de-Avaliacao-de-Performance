import React, { useEffect, useState } from "react";
import { API_URL } from '../../services/api';
import { useNavigate } from "react-router-dom";

const statusStyles: Record<string, string> = {
  "Em andamento": "bg-yellow-100 text-yellow-800",
  Finalizado: "bg-green-100 text-green-800",
};

const ColaboradoresList: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch(`${API_URL}/user`);
        if (!res.ok) throw new Error('Erro ao buscar colaboradores');
        const users = await res.json();
        // Filtra apenas usuários com role COLLABORATOR
        const colaboradores = users.filter((user: any) =>
          user.roles.some((role: any) => role.role === 'COLLABORATOR')
        );
        setColaboradores(colaboradores);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchColaboradores();
  }, []);

  if (loading) return <div>Carregando colaboradores...</div>;
  if (error) return <div>Erro: {error}</div>;

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
        {colaboradores.map((colab, idx) => (
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
                  {colab.unit?.name || 'Departamento'}
                </div>
              </div>
              {/* Status fictício, ajuste conforme necessário */}
              <span className={`ml-4 px-2 py-0.5 rounded text-xs font-medium ${statusStyles["Em andamento"]}`}>
                Em andamento
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-xs text-gray-500">
                Autoavaliação <span className="ml-1 font-semibold text-gray-900">-</span>
              </div>
              <div className="text-xs text-gray-500">
                Nota gestor <span className="ml-1 font-semibold text-gray-900">-</span>
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
        ))}
      </div>
    </div>
  );
};

export default ColaboradoresList;
