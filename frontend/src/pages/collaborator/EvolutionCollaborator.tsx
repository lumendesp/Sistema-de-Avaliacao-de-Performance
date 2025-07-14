import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EvolutionLayout from '../../layouts/EvolutionLayout';
import { API_URL } from '../../services/api';

const CollaboratorHistory = () => {
  const { id: paramId } = useParams();
  const { user } = useAuth();
  const id = paramId || user?.id;
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

        // Buscar nome do colaborador
        const userRes = await fetch(`${API_URL}/users/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        setCollaboratorName(userData.name);

        // Buscar todos os ciclos
        const ciclosRes = await fetch(`${API_URL}/ciclos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles = await ciclosRes.json();

        // Buscar histórico do colaborador
        const histRes = await fetch(`${API_URL}/ciclos/historico/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const histData = await histRes.json();

        // Mapear históricos pelo nome do ciclo
        const historicoMap = new Map(
          histData.map((c: any) => [c.cycle, c])
        );

        const ciclosCompletos = allCycles.map((cycle: any) => {
          const historico = historicoMap.get(cycle.name);

          if (historico) {
            return {
              cycle: cycle.name,
              status: cycle.status === 'PUBLISHED' ? 'Finalizado' : 'Em andamento',
              self: historico.self ?? '-',
              exec: historico.exec ?? '-',
              posture: historico.posture ?? '-',
              final: historico.final ?? '-',
              summary: historico.summary ?? '-',
            };
          } else if (cycle.status === 'IN_PROGRESS_COLLABORATOR') {
            return {
              cycle: cycle.name,
              status: 'Em andamento',
              self: '-',
              exec: '-',
              posture: '-',
              final: '-',
              summary: '-',
            };
          }

          return null;
        }).filter(Boolean); // Remove nulos

        setCycles(ciclosCompletos.sort((a, b) => b.cycle.localeCompare(a.cycle)));
        setTotalEvaluations(ciclosCompletos.length);

        const perf = ciclosCompletos
          .filter((c: any) => typeof c.final === 'number')
          .map((c: any) => ({ cycle: c.cycle, score: c.final }));

        setPerformance(perf);
        setCurrentScore(perf.length > 0 ? perf[0].score : 0);
        setGrowth(perf.length > 1 ? Number((perf[0].score - perf[1].score).toFixed(2)) : 0);
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
