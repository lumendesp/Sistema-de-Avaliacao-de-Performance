import React, { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import CollaboratorCard from "../../components/Mentor/CollaboratorCard.tsx";
import type { Collaborator } from "../../types/collaboratorStatus.tsx";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMentorMentees,
  fetchSelfEvaluation,
  fetchManagerEvaluation,
  fetchMentorToCollaboratorEvaluationsByCollaborator,
} from "../../services/api";

export default function MentorStatus() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Collaborator[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Collaborator[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, any>>({});
  const [selfEvaluations, setSelfEvaluations] = useState<Record<number, any>>(
    {}
  );
  // Novo state para as notas do mentor
  const [mentorScores, setMentorScores] = useState<
    Record<number, number | null>
  >({});

  useEffect(() => {
    if (!user?.id) return;
    fetchMentorMentees(user.id)
      .then(setMentees)
      .catch(() => setMentees([]));
  }, [user]);

  useEffect(() => {
    if (!mentees.length) return;
    const list = search.trim()
      ? mentees.filter((m) =>
          m.name.toLowerCase().includes(search.trim().toLowerCase())
        )
      : mentees;
    setFiltered(list);
    // Busca avaliações e autoavaliações reais
    Promise.all(
      list.map((mentee) =>
        Promise.all([
          fetchMentorToCollaboratorEvaluationsByCollaborator(mentee.id).catch(
            () => null
          ),
          fetchSelfEvaluation(mentee.id).catch(() => null),
        ])
      )
    ).then((results) => {
      const evalMap: Record<number, any> = {};
      const selfEvalMap: Record<number, any> = {};
      const mentorScoreMap: Record<number, number | null> = {};
      results.forEach(([mentorEvaluations, selfEval], idx) => {
        const id = list[idx].id;
        // Extrai a nota do mentor do ciclo mais recente
        let mentorScore = null;
        if (Array.isArray(mentorEvaluations) && mentorEvaluations.length > 0) {
          const latest = mentorEvaluations.reduce((prev, curr) => {
            const prevCycle = prev.cycleId ?? prev.cycle?.id ?? 0;
            const currCycle = curr.cycleId ?? curr.cycle?.id ?? 0;
            return currCycle > prevCycle ? curr : prev;
          });
          mentorScore = latest.score;
        }
        mentorScoreMap[id] = mentorScore;
        evalMap[id] = mentorEvaluations; // Mantém o array para debug, mas não é mais usado para nota
        // Pega a autoavaliação mais recente (maior cycleId)
        let latestSelf = null;
        if (Array.isArray(selfEval) && selfEval.length > 0) {
          latestSelf = selfEval.reduce((prev, curr) =>
            prev.cycle && curr.cycle && prev.cycle.id > curr.cycle.id
              ? prev
              : curr
          );
        }
        selfEvalMap[id] = latestSelf;
      });
      setEvaluations(evalMap);
      setSelfEvaluations(selfEvalMap);
      setMentorScores(mentorScoreMap);
    });
  }, [mentees, search]);

  function getStatusAndScore(collaboratorId: number) {
    // Busca avaliações do mentor para o colaborador
    const mentorEvaluations = evaluations[collaboratorId];
    const selfEval = selfEvaluations[collaboratorId];
    // Descobre o ciclo atual do mentor (IN_PROGRESS_MENTOR)
    // Para simplificar, pega o evaluation com maior cycleId
    let mentorStatus = "Pendente";
    let mentorScore = null;
    if (Array.isArray(mentorEvaluations) && mentorEvaluations.length > 0) {
      // Pega a avaliação do ciclo mais recente
      const latest = mentorEvaluations.reduce((prev, curr) => {
        const prevCycle = prev.cycleId ?? prev.cycle?.id ?? 0;
        const currCycle = curr.cycleId ?? curr.cycle?.id ?? 0;
        return currCycle > prevCycle ? curr : prev;
      });
      mentorScore = latest.score;
      if (latest.status === "submitted") mentorStatus = "Finalizado";
      else if (latest.status === "draft" || latest.status === "in_progress")
        mentorStatus = "Em andamento";
      else mentorStatus = "Pendente";
    }
    // Calcula as médias dos outros tipos normalmente
    let managerScore = null;
    let selfScore = null;
    if (selfEval && selfEval.items && selfEval.items.length > 0) {
      selfScore =
        selfEval.items.reduce((sum: number, item: any) => sum + item.score, 0) /
        selfEval.items.length;
    }
    return {
      status: mentorStatus as "Finalizado" | "Em andamento" | "Pendente",
      managerScore,
      selfScore,
      mentorScore,
    };
  }

  // Responsividade idêntica ao gestor
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F1F1F1] overflow-x-hidden sm:overflow-x-visible max-w-md sm:max-w-full mx-auto sm:mx-0">
      {/* Top bar com espaço para ícone da sidebar */}
      <div className="flex items-center gap-2 px-1 sm:px-6 pt-5 pb-3 justify-center sm:justify-start">
        <div className="hidden sm:flex h-10 items-center justify-center mr-0"></div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate text-left">
          Mentorados
        </h1>
      </div>
      <div className="w-full px-1 sm:px-6 mx-auto">
        <div className="flex items-center gap-2 rounded-xl py-3 px-3 bg-white/50 mt-0 mb-6 w-full">
          <IoIosSearch size={16} className="text-[#1D1D1D]/75 mr-2" />
          <input
            type="text"
            placeholder="Buscar por mentorados"
            className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent min-w-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4 sm:gap-6 w-full pb-6">
          {filtered.length > 0 ? (
            filtered.map((mentee) => {
              const { status, managerScore, selfScore, mentorScore } =
                getStatusAndScore(mentee.id);
              return (
                <CollaboratorCard
                  key={mentee.id}
                  collaborator={{
                    ...mentee,
                    status,
                    managerScore,
                    selfScore,
                    mentorScore,
                  }}
                />
              );
            })
          ) : (
            <p className="text-sm text-[#1D1D1D]/50 p-2 text-center">
              Nenhum mentorado encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
