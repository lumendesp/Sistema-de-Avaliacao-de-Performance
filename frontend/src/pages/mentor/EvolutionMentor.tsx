import React, { useEffect, useState } from "react";
import EvolutionLayout from "../../layouts/EvolutionLayout";
import { useParams } from "react-router-dom";
import { API_URL } from "../../services/api";

interface Cycle {
  cycle: string;
  status: string;
  self: number | string;
  exec: number | string;
  posture: number | string;
  final: number | string;
  summary: string;
}

interface Performance {
  cycle: string;
  score: number;
}

const EvolutionMentor = () => {
  const { id } = useParams();
  const collaboratorId = id ? Number(id) : null;
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);

  useEffect(() => {
    if (!collaboratorId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/ciclos/historico/${collaboratorId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: Cycle[] = await res.json();
        setCycles(data);
        setTotalEvaluations(data.length);
        if (data.length > 0) {
          const perf: Performance[] = data
            .filter((c) => typeof c.final === "number")
            .map((c) => ({ cycle: c.cycle, score: Number(c.final) }));
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
      } catch (e) {
        console.error("Erro ao buscar histórico:", e);
        setCycles([]);
        setPerformance([]);
        setCurrentScore(0);
        setGrowth(0);
      }
      setLoading(false);
    };
    fetchData();
  }, [collaboratorId]);

  if (!collaboratorId)
    return <div className="p-6 text-gray-500">Colaborador não encontrado.</div>;
  if (loading)
    return <div className="p-6 text-gray-500">Carregando histórico...</div>;

  return (
    <EvolutionLayout
      title="Evolução do colaborador"
      currentScore={currentScore}
      growth={growth}
      totalEvaluations={totalEvaluations}
      performance={performance}
      cycles={cycles}
    />
  );
};

export default EvolutionMentor;
