import State from "./StatesCommittee"
import Assessment from "./AssessmentColaboratorsPreview"
import { UserIcon } from "../UserIcon";

interface ColaboratorsCommitteeProps {
    // Profile info
    name: string;
    role: string;
    initials: string;
    state: 'finalizado' | 'pendente' | 'expirado';
    
    // Assessment grades
    autoAvaliacao?: number;
    avaliacao360?: number;
    notaGestor?: number;
    notaFinal?: number;
}

function ColaboratorsCommitte({
    name,
    role,
    initials,
    state,
    autoAvaliacao,
    avaliacao360,
    notaGestor,
    notaFinal
}: ColaboratorsCommitteeProps) {
    return(
        <div className="border border-gray-300 rounded-md bg-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-x-4">
                <UserIcon initials={initials} size={40} />

                <div>
                    <h3>{name}</h3>
                    <h4 className="text-gray-500 text-sm">{role}</h4>
                </div>
                <State state={state}/>
            </div>
            <div>
                <Assessment 
                    autoAvaliacao={autoAvaliacao}
                    avaliacao360={avaliacao360}
                    notaGestor={notaGestor}
                    notaFinal={notaFinal}
                />
            </div>
        </div>
    )
};

export default ColaboratorsCommitte;