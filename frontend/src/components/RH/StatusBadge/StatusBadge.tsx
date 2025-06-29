import { type EvaluationStatus } from '../../../types/evaluations';

interface StatusBadgeProps {
    status: EvaluationStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
    const statusStyles = {
        finalizado: {
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            text: 'Finalizado'
        },
        pendente: {
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            text: 'Pendente'
        },
    };

    const currentStyle = statusStyles[status];

    return (
        <div className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${currentStyle.bgColor} ${currentStyle.textColor}`}>
            {currentStyle.text}
        </div>
    );
}

export default StatusBadge;