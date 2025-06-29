import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EvolutionLayout from '../../layouts/EvolutionLayout';
import { API_URL } from '../../services/api';

const CollaboratorHistory = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [growth, setGrowth] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);
  const [collaboratorName, setCollaboratorName] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Primeiro, buscar informações do colaborador
        const userRes = await fetch(`${API_URL}/users/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const userData = await userRes.json();
        setCollaboratorName(userData.name);

        // Depois, buscar o histórico do colaborador
        const res = await fetch(`${API_URL}/ciclos/historico/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
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
        console.error('Erro ao buscar histórico do colaborador:', e);
        setCycles([]);
        setPerformance([]);
        setCurrentScore(0);
        setGrowth(0);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (!id) return <div className="p-6 text-gray-500">ID do colaborador não fornecido.</div>;
  
  if (loading) return <div className="p-6 text-gray-500">Carregando histórico do colaborador...</div>;

  if (cycles.length === 0) {
    return <div className="p-6 text-gray-500">Este colaborador ainda não possui ciclos avaliados.</div>;
  }

  return (
    <EvolutionLayout
      title={`Histórico de ${collaboratorName}`}
      currentScore={currentScore}
      growth={growth}
      totalEvaluations={totalEvaluations}
      performance={performance}
      cycles={cycles}
    />
  );
};

export default CollaboratorHistory; 