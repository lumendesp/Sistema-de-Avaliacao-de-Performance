import React, { useEffect, useState } from 'react';
import EvolutionLayout from '../../layouts/EvolutionLayout';
import { useParams } from 'react-router-dom';

const EvolutionCollaborator = () => {
  const { id } = useParams();
  const userId = id ? Number(id) : 1;
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/ciclos/historico/${userId}`);
        const data = await res.json();
        setCycles(data);
        setTotalEvaluations(data.length);
        if (data.length > 0) {
          // performance: array de { cycle, score }
          const perf = data
            .filter((c: any) => typeof c.final === 'number')
            .map((c: any) => ({ cycle: c.cycle, score: c.final }));
          setPerformance(perf);
          setCurrentScore(perf.length > 0 ? perf[0].score : 0);
          setGrowth(perf.length > 1 ? Number((perf[0].score - perf[1].score).toFixed(2)) : 0);
        } else {
          setPerformance([]);
          setCurrentScore(0);
          setGrowth(0);
        }
      } catch (e) {
        setCycles([]);
        setPerformance([]);
        setCurrentScore(0);
        setGrowth(0);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) return <div className="p-6">Carregando evolução...</div>;

  if (cycles.length === 0) {
    return <div className="p-6 text-gray-500">Este usuário não possui ciclos avaliados.</div>;
  }

  return (
    <EvolutionLayout
      title="Evolução (Colaborador)"
      currentScore={currentScore}
      growth={growth}
      totalEvaluations={totalEvaluations}
      performance={performance}
      cycles={cycles}
    />
  );
};

export default EvolutionCollaborator; 