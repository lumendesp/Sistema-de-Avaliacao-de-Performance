type StateType = 'finalizado' | 'pendente' | 'expirado';

interface StatesCommitteeProps {
    state: StateType;
}

function StatesCommittee({ state }: StatesCommitteeProps) {
    const states = {
        finalizado: {
            bgColor: 'bg-green-200',
            textColor: 'text-green-700',
            text: 'Finalizado'
        },
        pendente: {
            bgColor: 'bg-yellow-200',
            textColor: 'text-yellow-700',
            text: 'Pendente'
        },
        expirado: {
            bgColor: 'bg-red-200',
            textColor: 'text-red-700',
            text: 'Expirado'
        }
    };

    const currentState = states[state];

    return (
        <div className={`px-3 py-1 rounded-md font-medium inline-block ${currentState.bgColor} ${currentState.textColor}`}>
            {currentState.text}
        </div>
    );
}

export default StatesCommittee;