import React, { useEffect, useState } from "react";
import EvolutionLayout from "../../layouts/EvolutionLayout";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/api";

const EvolutionManager = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/ciclos/historico/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setCycles(data);
        setTotalEvaluations(data.length);
        if (data.length > 0) {
          // performance: array de { cycle, score }
          const perf = data
            .filter((c: any) => typeof c.final === "number")
            .map((c: any) => ({ cycle: c.cycle, score: c.final }));
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
  }, [userId]);

  if (!userId)
    return <div className="p-6 text-gray-500">Usuário não autenticado.</div>;

  if (loading)
    return <div className="p-6 text-gray-500">Carregando histórico...</div>;

  if (!cycles || cycles.length === 0) {
    return (
      <div className="p-6 text-gray-500 text-left">
        Colaborador não possui ciclos avaliados.
      </div>
    );
  }

  return (
    <EvolutionLayout
      title="Minha Evolução"
      currentScore={currentScore}
      growth={growth}
      totalEvaluations={totalEvaluations}
      performance={performance}
      cycles={cycles}
    />
  );
};

export default EvolutionManager;
