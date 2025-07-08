import State from "./StatesCommittee"
import Assessment from "./AssessmentColaboratorsPreview"
import { UserIcon } from "../UserIcon";
import { useState } from 'react';

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
    notaMentor: number;
    // Drop info
    dropInfo?: { text: string; percent: number };
}

function ColaboratorsCommitte({
    name,
    role,
    initials,
    state,
    autoAvaliacao,
    avaliacao360,
    notaGestor,
    notaFinal,
    notaMentor,
    dropInfo
}: ColaboratorsCommitteeProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    return(
        <div className="border border-gray-300 rounded-md bg-white p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-x-3 sm:gap-x-4 w-full sm:w-auto">
                <UserIcon initials={initials} size={40} />

                <div className="flex-1 sm:flex-none flex items-center gap-2 relative">
                    <div>
                        <h3 className="text-sm sm:text-base font-medium">{name}</h3>
                        <h4 className="text-gray-500 text-xs sm:text-sm">{role}</h4>
                    </div>
                    {dropInfo && (
                        <div
                            className="ml-2 relative flex items-center"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <div className="w-6 h-6 rounded-full bg-[#08605F] flex items-center justify-center cursor-pointer border-2 border-white shadow" style={{ minWidth: 24, minHeight: 24 }}>
                                <span className="text-white font-bold text-base select-none">i</span>
                            </div>
                            {showTooltip && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border border-gray-300 rounded shadow-lg px-3 py-2 text-xs text-gray-800 z-50 whitespace-nowrap">
                                    {dropInfo.text} <span className="text-[#08605F] font-semibold">({dropInfo.percent}%)</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <State state={state}/>
            </div>
            <div className="w-full sm:w-auto">
                <Assessment 
                    autoAvaliacao={autoAvaliacao}
                    avaliacao360={avaliacao360}
                    notaGestor={notaGestor}
                    notaMentor={notaMentor}
                    notaFinal={notaFinal}
                />
            </div>
        </div>
    )
};

export default ColaboratorsCommitte;