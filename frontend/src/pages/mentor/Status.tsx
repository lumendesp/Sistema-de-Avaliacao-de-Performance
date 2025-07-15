import React, { useEffect, useState } from "react";
import searchIcon from "../../assets/search.png";
import CollaboratorCard from "../../components/mentor/CollaboratorCard";
import type { Collaborator } from "../../types/collaboratorStatus.tsx";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMentorMentees,
  fetchSelfEvaluation,
  fetchManagerEvaluation,
  fetchMentorToCollaboratorEvaluationsByCollaborator
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
  const [mentorScores, setMentorScores] = useState<Record<number, number | null>>({});

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
          fetchMentorToCollaboratorEvaluationsByCollaborator(mentee.id).catch(() => null),
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
    const evaluation = evaluations[collaboratorId];
    const selfEval = selfEvaluations[collaboratorId];
    const allCriteria = (evaluation?.groups || []).flatMap(
      (g: any) => g.items || []
    );
    const withScore = allCriteria.filter(
      (c: any) => c.score !== null && c.score !== undefined
    );
    const filled = allCriteria.filter(
      (c: any) =>
        c.score !== null &&
        c.score !== undefined &&
        c.justification &&
        c.justification.trim() !== ""
    );
    const total = allCriteria.length;
    let managerScore = null;
    if (withScore.length > 0) {
      managerScore =
        withScore.reduce((sum: number, c: any) => sum + (c.score || 0), 0) /
        withScore.length;
    }
    let selfScore = null;
    if (selfEval && selfEval.items && selfEval.items.length > 0) {
      selfScore =
        selfEval.items.reduce((sum: number, item: any) => sum + item.score, 0) /
        selfEval.items.length;
    }
    let mentorScore = mentorScores[collaboratorId] ?? null;
    if (!evaluation || total === 0 || withScore.length === 0) {
      return { status: "Pendente" as const, managerScore: null, selfScore, mentorScore };
    }
    if (filled.length < total) {
      return { status: "Em andamento" as const, managerScore, selfScore, mentorScore };
    }
    return { status: "Finalizado" as const, managerScore, selfScore, mentorScore };
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F6FA]">
      <div className="h-[20px] w-full" />
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight ml-0 pl-8">
        Mentorados
      </h1>
      <div className="h-[60px] w-full" />
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white/50 mt-0 mb-4">
        <input
          type="text"
          placeholder="Buscar por mentorados"
          className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-teal-700 text-white p-2 rounded-md">
          <img src={searchIcon} alt="Buscar" className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-4 w-full px-8">
        {filtered.length > 0 ? (
          filtered.map((mentee) => {
            const { status, managerScore, selfScore, mentorScore } = getStatusAndScore(
              mentee.id
            );
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
          <p className="text-sm text-[#1D1D1D]/50 p-2">
            Nenhum mentorado encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
