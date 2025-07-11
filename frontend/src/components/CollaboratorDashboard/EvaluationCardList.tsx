import EvaluationCardMini from './EvaluationCardMini';
import type { CicloProps } from '../../types/DashboardCollaboratorTypes/evaluationCardList';

const EvaluationCardList = () => {
  const ciclos: CicloProps[] = [
    {
      ciclo: '2025.1',
      status: 'Em andamento',
      resumo: 'Você se autoavaliou bem por conta dessa etapa',
    },
    {
      ciclo: '2024.2',
      nota: 4.5,
      status: 'Finalizado',
      destaque: 'Great',
      resumo: 'Você se autoavaliou bem por conta dessa etapa',
    },
    {
      ciclo: '2024.1',
      nota: 4.1,
      status: 'Finalizado',
      destaque: 'Good',
      resumo: 'Você se autoavaliou bem por conta dessa etapa',
    },
    {
      ciclo: '2023.2',
      nota: 3.2,
      status: 'Finalizado',
      destaque: 'Normal',
      resumo: 'Você se autoavaliou bem por conta dessa etapa',
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">Suas avaliações</h2>
        <a href="#" className="text-sm text-green-main font-medium hover:underline">
          Ver mais
        </a>
      </div>

      {/* Lista scrollável */}
      <div className="flex flex-col gap-3 max-h-[300px] sm:max-h-80 overflow-y-auto pr-1">
        {ciclos.map((c, idx) => (
          <EvaluationCardMini key={idx} {...c} />
        ))}
      </div>
    </div>
  );
};

export default EvaluationCardList;
