type StateType = 'finalizado' | 'pendente' | 'expirado';

interface StatesCommitteeProps {
    state: StateType;
}

function StatesCommittee({ state }: StatesCommitteeProps) {
    const states = {
        finalizado: {
            bgColor: 'bg-[#BEE7CF]',
            textColor: 'text-[#419958]',
            text: 'Finalizado'
        },
        pendente: {
            bgColor: 'bg-[#FEEC65]/50',
            textColor: 'text-[#F5AA30]',
            text: 'Pendente'
        },
        expirado: {
            bgColor: 'bg-[#F7C8C8]',
            textColor: 'text-[#E14C4C]',
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