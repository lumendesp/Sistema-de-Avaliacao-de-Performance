import { useEffect, useState } from 'react';
import EvaluationCardMini from './EvaluationCardMini';
import type { CicloProps } from '../../types/DashboardCollaboratorTypes/evaluationCardList';
import { useAuth } from '../../context/AuthContext';

const EvaluationCardList = () => {
  const { token, user } = useAuth();
  const [ciclos, setCiclos] = useState<CicloProps[]>([]);

  useEffect(() => {
    const fetchCiclos = async () => {
      try {
        const response = await fetch('http://localhost:3000/ciclos', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ciclosData = await response.json();

        if (!Array.isArray(ciclosData)) {
          console.error('Resposta de ciclos não é um array:', ciclosData);
          return;
        }

        const ciclosComNotas: CicloProps[] = await Promise.all(
          ciclosData
            .sort((a, b) => b.id - a.id)
            .map(async (ciclo: any) => {

            const isFinalizado = ciclo.status === 'PUBLISHED';

            let nota: number | undefined;
            let destaque: string | undefined;

            if (isFinalizado) {
              try {
                const notaRes = await fetch(
                  `http://localhost:3000/final-scores/user/${user.id}/cycle/${ciclo.id}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (notaRes.ok) {
                  const notaData = await notaRes.json();
                  nota = notaData.finalScore;

                  if (typeof nota === 'number') {
                    if (nota >= 4.5) destaque = 'Excelente';
                    else if (nota >= 4) destaque = 'Muito bom';
                    else if (nota >= 3.5) destaque = 'Bom';
                    else if (nota >= 3) destaque = 'Normal';
                    else if (nota >= 2) destaque = 'Ruim';
                    else if (nota >= 1) destaque = 'Péssimo';
                    else destaque = 'Sem avaliação';
                  }
                }
              } catch (e) {
                console.warn(`Erro ao buscar nota para ciclo ${ciclo.name}`, e);
              }
            }

            return {
              ciclo: ciclo.name,
              status: isFinalizado ? 'Finalizado' : 'Em andamento',
              nota,
              destaque,
              resumo: 'Você se autoavaliou bem por conta dessa etapa',
            };
          })
        );

        setCiclos(ciclosComNotas);
      } catch (error) {
        console.error('Erro ao buscar ciclos:', error);
      }
    };

    fetchCiclos();
  }, [token, user]);

  return (
    <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">Suas avaliações</h2>
        <a href="#" className="text-sm text-green-main font-medium hover:underline">
          Ver mais
        </a>
      </div>

      <div className="flex flex-col gap-3 max-h-[300px] sm:max-h-80 overflow-y-auto pr-1">
        {ciclos.map((c, idx) => (
          <EvaluationCardMini key={idx} {...c} />
        ))}
      </div>
    </div>
  );
};

export default EvaluationCardList;
