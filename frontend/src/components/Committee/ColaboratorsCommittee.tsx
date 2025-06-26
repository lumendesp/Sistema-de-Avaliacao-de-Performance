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
        <div className="border border-gray-300 rounded-md bg-white p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-x-3 sm:gap-x-4 w-full sm:w-auto">
                <UserIcon initials={initials} size={40} />

                <div className="flex-1 sm:flex-none">
                    <h3 className="text-sm sm:text-base font-medium">{name}</h3>
                    <h4 className="text-gray-500 text-xs sm:text-sm">{role}</h4>
                </div>
                <State state={state}/>
            </div>
            <div className="w-full sm:w-auto">
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