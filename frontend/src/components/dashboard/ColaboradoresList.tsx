import React from "react";

const colaboradores = [
  {
    nome: "Colaborador 1",
    departamento: "Product Design",
    status: "Em andamento",
    autoavaliacao: 4.0,
    notaGestor: null,
    initials: "CN",
  },
  {
    nome: "Colaborador 2",
    departamento: "Dev",
    status: "Em andamento",
    autoavaliacao: 4.0,
    notaGestor: null,
    initials: "CN",
  },
  {
    nome: "Colaborador 3",
    departamento: "Product Design",
    status: "Em andamento",
    autoavaliacao: 4.0,
    notaGestor: null,
    initials: "CN",
  },
  {
    nome: "Colaborador 4",
    departamento: "Product Design",
    status: "Finalizado",
    autoavaliacao: 4.0,
    notaGestor: 4.5,
    initials: "CN",
  },
  {
    nome: "Colaborador 5",
    departamento: "Product Design",
    status: "Finalizado",
    autoavaliacao: 4.0,
    notaGestor: 4.5,
    initials: "CN",
  },
];

const statusStyles: Record<string, string> = {
  "Em andamento": "bg-yellow-100 text-yellow-800",
  Finalizado: "bg-green-100 text-green-800",
};

const ColaboradoresList: React.FC = () => {
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
          <div
            key={idx}
            className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg">
                {colab.initials}
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">
                  {colab.nome}
                </div>
                <div className="text-xs text-gray-500">
                  {colab.departamento}
                </div>
              </div>
              <span
                className={`ml-4 px-2 py-0.5 rounded text-xs font-medium ${
                  statusStyles[colab.status]
                }`}
              >
                {colab.status}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-xs text-gray-500">
                Autoavaliação{" "}
                <span className="ml-1 font-semibold text-gray-900">
                  {colab.autoavaliacao.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Nota gestor{" "}
                <span className="ml-1 font-semibold text-gray-900">
                  {colab.notaGestor !== null ? (
                    colab.notaGestor.toFixed(1)
                  ) : (
                    <span className="inline-block w-6 text-center">-</span>
                  )}
                </span>
              </div>
              {colab.notaGestor !== null && (
                <span className="bg-teal-700 text-white rounded px-2 py-0.5 text-sm font-semibold">
                  {colab.notaGestor.toFixed(1)}
                </span>
              )}
              <button className="ml-2 text-gray-400 hover:text-teal-700">
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
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColaboradoresList;
