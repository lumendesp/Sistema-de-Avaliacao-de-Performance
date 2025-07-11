import React, { useEffect, useState } from "react";
import EvolutionLayout from "../../layouts/EvolutionLayout";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMentorMentees,
  fetchCollaboratorCyclesHistory,
} from "../../services/api";
import type { Collaborator } from "../../types/collaboratorStatus";

type CycleHistory = { cycle: string; final: number };
type PerformanceEntry = { cycle: string; score: number };

const EvolutionManager = () => {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Collaborator[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<Collaborator | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState<CycleHistory[]>([]);
  const [performance, setPerformance] = useState<PerformanceEntry[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    fetchMentorMentees(user.id)
      .then(setMentees)
      .catch(() => setMentees([]));
  }, [user]);

  useEffect(() => {
    if (!selectedMentee) return;
    setLoading(true);
    fetchCollaboratorCyclesHistory(selectedMentee.id)
      .then((data) => {
        setCycles(data);
        setTotalEvaluations(data.length);
        if (data.length > 0) {
          const perf = data
            .filter((c: CycleHistory) => typeof c.final === "number")
            .map((c: CycleHistory) => ({ cycle: c.cycle, score: c.final }));
          setPerformance(perf);
          setCurrentScore(perf.length > 0 ? perf[0].score : 0);
          setGrowth(
            perf.length > 1
              ? Number((perf[0].score - perf[1].score).toFixed(2))
              : 0
          );
        } else {
          setPerformance([]);
          setCurrentScore(0);
          setGrowth(0);
        }
      })
      .catch(() => {
        setCycles([]);
        setPerformance([]);
        setCurrentScore(0);
        setGrowth(0);
      })
      .finally(() => setLoading(false));
  }, [selectedMentee]);

  if (!user?.id)
    return <div className="p-6 text-gray-500">Usuário não autenticado.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-8">
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Selecione um mentorado:
        </label>
        <select
          className="p-2 rounded border"
          value={selectedMentee?.id || ""}
          onChange={(e) => {
            const mentee = mentees.find((m) => m.id === Number(e.target.value));
            setSelectedMentee(mentee || null);
          }}
        >
          <option value="">-- Escolha --</option>
          {mentees.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      {loading && (
        <div className="p-6 text-gray-500">Carregando histórico...</div>
      )}
      {!loading && selectedMentee && (
        <EvolutionLayout
          title={`Evolução de ${selectedMentee.name}`}
          currentScore={currentScore}
          growth={growth}
          totalEvaluations={totalEvaluations}
          performance={performance}
          cycles={cycles.map((c) => ({
            ...c,
            status: "",
            self: 0,
            exec: 0,
            posture: 0,
            summary: "",
          }))}
        />
      )}
      {!loading && !selectedMentee && (
        <div className="p-6 text-gray-500">
          Selecione um mentorado para visualizar a evolução.
        </div>
      )}
    </div>
  );
};

export default EvolutionManager;
