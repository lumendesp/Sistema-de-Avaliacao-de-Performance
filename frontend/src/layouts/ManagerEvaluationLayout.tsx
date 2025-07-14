import React, { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import type { Collaborator } from "../types/collaboratorStatus";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000";

export default function ManagerEvaluationLayout() {
  const { id } = useParams();
  const { user } = useAuth();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [hasSent, setHasSent] = useState(false); // controla se já enviou pelo menos uma vez
  const [isEditing, setIsEditing] = useState(true); // começa editável
  // Ref para acessar a função de submit do filho
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    if (user && user.id && id) {
      fetch(`${API_URL}/managers/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const parsed = (data.collaborators || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            role: c.roles?.[0]?.role || "Colaborador",
            status: c.status || "Em andamento",
            selfScore: c.selfScore ?? 0,
            managerScore: c.managerScore ?? null,
          }));
          const found = parsed.find((c: Collaborator) => c.id === Number(id));
          setCollaborator(found || null);
        })
        .catch(() => setCollaborator(null));
    }
  }, [user, id]);

  // Recebe do filho se é update ou create
  const handleSetSubmit = (fn: () => Promise<boolean>, updateFlag: boolean) => {
    submitRef.current = fn;
    setIsUpdate(updateFlag);
  };

  const [lastSent, setLastSent] = useState<Date | null>(null);
  const handleSend = async () => {
    if (isEditing) {
      if (submitRef.current) {
        const ok = await submitRef.current();
        if (ok) {
          setLastSent(new Date());
          setIsEditing(false); // bloqueia após envio
          setHasSent(true); // marca que já enviou pelo menos uma vez
          window.alert("Avaliação enviada com sucesso!");
        } else {
          window.alert("Erro ao enviar avaliação.");
        }
      }
    } else {
      setIsEditing(true); // libera edição ao clicar em editar
    }
  };

  if (!collaborator) {
    return <div>Colaborador não encontrado</div>;
  }

  const { name, role } = collaborator;
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="fixed top-0 left-64 right-0 w-[calc(100%-16rem)] bg-white shadow-md z-30">
          <div className="px-8 py-5 flex flex-row items-center border-b border-gray-200 justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                {initials}
              </div>
              <div className="truncate">
                <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">
                  {name}
                </h1>
                <p className="text-sm text-gray-500 truncate">COLABORADOR</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastSent && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Último envio: {lastSent.toLocaleString("pt-BR")}
                </span>
              )}
              <button
                className="bg-[#8CB7B7] font-semibold text-white px-5 py-2 rounded-md text-sm shadow-sm hover:bg-[#7aa3a3] transition whitespace-nowrap"
                onClick={handleSend}
              >
                {isEditing
                  ? !hasSent
                    ? "Enviar"
                    : "Atualizar"
                  : "Editar avaliação"}
              </button>
            </div>
          </div>
          <nav className="bg-white border-b border-gray-100">
            <ul className="flex px-8 pt-4 gap-16 text-lg text-gray-600 font-semibold">
              <li>
                <NavLink
                  to=""
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-3 flex items-center gap-2"
                  }
                >
                  Avaliação
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="360"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-3 flex items-center gap-2"
                  }
                >
                  Avaliação 360
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="historico"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-3 flex items-center gap-2"
                  }
                >
                  Histórico
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <div className="h-[145px]" />
        {/* Espaço para não cobrir o conteúdo pelo bloco fixo */}
        <main className="flex-1 flex justify-center items-start p-2 sm:p-4">
          <div className="w-full max-w-7xl">
            <Outlet context={{ setSubmit: handleSetSubmit, isEditing }} />
          </div>
        </main>
      </div>
      {/* Corrige o fundo cinza para encostar nas bordas */}
      <style>{`
        body, #root {
          background: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
}
