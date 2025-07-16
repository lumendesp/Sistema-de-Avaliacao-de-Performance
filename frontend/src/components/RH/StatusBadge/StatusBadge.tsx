import { type EvaluationStatus } from '../../../types/evaluations';

interface StatusBadgeProps {
    status: EvaluationStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
    const statusStyles = {
        finalizado: {
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            text: 'Finalizado'
        },
        pendente: {
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            text: 'Pendente'
        },
        em_andamento: {
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
            text: 'Em andamento'
        },
    };

    const currentStyle = statusStyles[status] || statusStyles.pendente;

    // Se por algum motivo um status inesperado for passado, podemos ter um fallback

    return (
        <div className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${currentStyle.bgColor} ${currentStyle.textColor}`}>
            {currentStyle.text}
        </div>
    );
}

export default StatusBadge;