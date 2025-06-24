import React, { useEffect, useState } from 'react';
import EvolutionLayout from '../../layouts/EvolutionLayout';

const USER_ID = 1;

const EvolutionCollaborator = () => {
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
        const res = await fetch(`http://localhost:3000/ciclos/historico/${USER_ID}`);
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
  }, []);

  if (loading) return <div className="p-6">Carregando evolução...</div>;

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