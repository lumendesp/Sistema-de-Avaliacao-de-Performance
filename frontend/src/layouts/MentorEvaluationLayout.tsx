import React, { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import type { Collaborator } from "../types/collaboratorStatus";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000";

export default function MentorEvaluationLayout() {
  const { id } = useParams();
  const { user } = useAuth();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  // Ref para acessar a função de submit do filho
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);

  // Espaço dinâmico para compensar header/nav fixos
  const [spacerHeight, setSpacerHeight] = useState(145);
  const headerBlockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function updateSpacer() {
      if (headerBlockRef.current) {
        setSpacerHeight(headerBlockRef.current.offsetHeight || 0);
      }
    }
    updateSpacer();
    window.addEventListener("resize", updateSpacer);
    return () => window.removeEventListener("resize", updateSpacer);
  }, []);

  useEffect(() => {
    if (user && user.id && id) {
      fetch(`${API_URL}/mentors/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const parsed = (data.mentees || []).map((c: Collaborator) => ({
            id: c.id,
            name: c.name,
            role: c.role || "Colaborador",
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

  const handleSend = async () => {
    if (submitRef.current) {
      const ok = await submitRef.current();
      if (ok) {
        window.alert("Avaliação enviada com sucesso!");
      } else {
        window.alert("Erro ao enviar avaliação.");
      }
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
    <div className="min-h-screen flex bg-[#F1F1F1] overflow-x-hidden">
      <div className="flex-1 flex flex-col">
        <div
          ref={headerBlockRef}
          className="fixed top-0 left-0 right-0 w-full sm:left-64 sm:w-[calc(100%-16rem)] bg-white shadow-md z-30 max-w-screen overflow-x-auto box-border"
        >
          <div className="px-2 sm:px-8 py-3 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center border-b border-gray-200 justify-between gap-2 sm:gap-3 w-full box-border">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-full">
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-gray-100 items-center justify-center text-lg font-bold text-gray-600">
                {initials}
              </div>
              <div className="truncate w-full flex flex-col items-center justify-center text-center sm:items-start sm:justify-start sm:text-left">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">
                  {name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  COLABORADOR
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 w-full sm:w-auto text-center sm:text-left mt-2 sm:mt-0">
              <button
                className="bg-[#8CB7B7] font-semibold text-white px-5 py-2 rounded-md text-sm shadow-sm hover:bg-[#7aa3a3] transition whitespace-nowrap"
                onClick={handleSend}
              >
                {isUpdate ? "Atualizar" : "Enviar"}
              </button>
            </div>
          </div>
          {/* Navegação responsiva */}
          <nav className="bg-white border-b border-gray-100 w-full overflow-x-auto max-w-screen box-border">
            <ul className="flex flex-col sm:flex-row px-2 sm:px-8 pt-2 sm:pt-4 gap-1 sm:gap-10 text-base sm:text-lg text-gray-600 font-semibold w-full box-border">
              <li>
                <NavLink
                  to=""
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-2 sm:pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-2 sm:pb-3 flex items-center gap-2"
                  }
                >
                  Avaliação
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="autoavaliacao"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-2 sm:pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-2 sm:pb-3 flex items-center gap-2"
                  }
                >
                  Autoavaliação
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="360"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-2 sm:pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-2 sm:pb-3 flex items-center gap-2"
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
                      ? "border-b-2 border-teal-700 pb-2 sm:pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-2 sm:pb-3 flex items-center gap-2"
                  }
                >
                  Histórico
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        {/* Espaço dinâmico para não cobrir o conteúdo pelo header/nav fixos */}
        <div style={{ width: "100%", height: spacerHeight }} />
        {/* Espaço para não cobrir o conteúdo pelo bloco fixo */}
        <main className="flex-1 flex justify-center items-start p-2 sm:p-4 w-full overflow-x-auto max-w-screen box-border">
          <div className="w-full max-w-full sm:max-w-7xl box-border">
            <Outlet context={{ setSubmit: handleSetSubmit }} />
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
