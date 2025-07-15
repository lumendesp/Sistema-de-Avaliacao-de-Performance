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

        const userRes = await fetch(`${API_URL}/users/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        setCollaboratorName(userData.name);

        const ciclosRes = await fetch(`${API_URL}/ciclos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles = await ciclosRes.json();

        const histRes = await fetch(`${API_URL}/ciclos/historico/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const histData = await histRes.json();
        const historicoMap = new Map(histData.map((c: any) => [c.cycle, c]));

        const fetchLeanSummary = async (cycleId: string) => {
          try {
            const response = await fetch(
              `${API_URL}/ai-summary/lean?userId=${id}&cycleId=${cycleId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (response.ok) {
              const text = await response.text();
              return text.trim();
            }
          } catch (error) {
            console.error(`Erro ao buscar resumo do ciclo ${cycleId}:`, error);
          }
          return '-';
        };

        const ciclosCompletos = await Promise.all(
          allCycles.map(async (cycle: any) => {
            const historico = historicoMap.get(cycle.name);

            let peerScore = '-';
            try {
              const peerRes = await fetch(
                `${API_URL}/peer-evaluations/average/cycle/${cycle.id}/user/${id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (peerRes.ok) {
                const peerData = await peerRes.json();
                peerScore = peerData?.average?.toFixed(1) ?? '-';
              }
            } catch (err) {
              console.error(`Erro ao buscar avaliação 360 do ciclo ${cycle.name}:`, err);
            }

            const summary = await fetchLeanSummary(cycle.id);

            if (historico || cycle.status === 'PUBLISHED') {
              return {
                cycle: cycle.name,
                status: 'Finalizado',
                self: historico?.self ?? '-',
                exec: peerScore,
                posture: historico?.posture ?? '-',
                final: historico?.final ?? '-',
                summary,
              };
            } else if (cycle.status === 'IN_PROGRESS_COLLABORATOR') {
              return {
                cycle: cycle.name,
                status: 'Em andamento',
                self: '-',
                exec: peerScore,
                posture: '-',
                final: '-',
                summary: '-',
              };
            }

            return null;
          })
        );

        const filtrados = ciclosCompletos.filter(Boolean);
        setCycles(filtrados.sort((a, b) => b.cycle.localeCompare(a.cycle)));
        setTotalEvaluations(filtrados.length);

        const perf = filtrados
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
