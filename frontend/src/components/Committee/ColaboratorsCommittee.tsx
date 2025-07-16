import State from "./StatesCommittee"
import Assessment from "./AssessmentColaboratorsPreview"
import { UserIcon } from "../UserIcon";
import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { translateRole } from '../../utils/roleTranslations';

interface ColaboratorsCommitteeProps {
    // Profile info
    name: string;
    role: string;
    roleRaw?: any[]; // Add roleRaw prop
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

// Helper to get display roles (excluding 'Administrador')
function getDisplayRoles(roles: any[]): string[] {
    return roles
        .map((r: any) => translateRole(r.role))
        .filter(role => role !== 'Administrador');
}

function ColaboratorsCommitte({
    name,
    role,
    roleRaw,
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

    // Calculate discrepancies
    const grades = [
        { label: 'Autoavaliação', value: autoAvaliacao },
        { label: 'Avaliação 360', value: avaliacao360 },
        { label: 'Nota do Gestor', value: notaGestor },
        { label: 'Nota do Mentor', value: notaMentor },
    ];
    let maxDiscrepancy = 0;
    let discrepancyInfo = null;
    for (let i = 0; i < grades.length; i++) {
        for (let j = i + 1; j < grades.length; j++) {
            const v1 = grades[i].value;
            const v2 = grades[j].value;
            if (typeof v1 === 'number' && typeof v2 === 'number' && v1 > 0 && v2 > 0) {
                const diff = Math.abs(v1 - v2);
                const percent = (diff / Math.max(v1, v2)) * 100;
                if (percent > maxDiscrepancy) {
                    maxDiscrepancy = percent;
                    discrepancyInfo = {
                        percent: Math.round(percent * 10) / 10,
                        label1: grades[i].label,
                        value1: Math.round(v1 * 10) / 10,
                        label2: grades[j].label,
                        value2: Math.round(v2 * 10) / 10,
                    };
                }
            }
        }
    }
    const hasDiscrepancy = maxDiscrepancy >= 40;

    return(
        <div className="border border-gray-300 rounded-md bg-white p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 w-full overflow-x-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-2 sm:gap-x-4 w-full sm:w-auto">
                <UserIcon initials={initials} size={36} />
                <div className="flex-1 sm:flex-none flex items-center gap-1 sm:gap-2 relative">
                    <div>
                        <h3 className="text-xs sm:text-sm md:text-base font-medium">{name}</h3>
                        {(() => {
                            if (!roleRaw) {
                                return <h4 className="text-gray-500 text-xs sm:text-sm">{role}</h4>;
                            }
                            const displayRoles = getDisplayRoles(roleRaw);
                            if (displayRoles.length === 0) return null;
                            if (displayRoles.length === 1) {
                                return <h4 className="text-gray-500 text-xs sm:text-sm">{displayRoles[0]}</h4>;
                            }
                            return (
                                <div className="text-gray-500 text-xs sm:text-sm relative group cursor-pointer">
                                    {displayRoles[0]}
                                    <span className="ml-1 text-gray-400">+{displayRoles.length - 1}</span>
                                    <div className="absolute left-0 z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-md p-2 mt-1 text-xs text-gray-700 min-w-max">
                                        {displayRoles.join(', ')}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    {(hasDiscrepancy && discrepancyInfo) || (dropInfo && !hasDiscrepancy) ? (
                        <div
                            className="ml-1 sm:ml-2 relative flex items-center"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <FaExclamationTriangle className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" style={{ minWidth: 20, minHeight: 20 }} />
                            {showTooltip && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border border-gray-300 rounded shadow-lg px-3 py-2 text-xs text-gray-800 z-50 whitespace-nowrap">
                                    {hasDiscrepancy && discrepancyInfo ? (
                                        <>
                                            Discrepância de {discrepancyInfo.percent}% entre <b>{discrepancyInfo.label1}</b> ({discrepancyInfo.value1}) e <b>{discrepancyInfo.label2}</b> ({discrepancyInfo.value2}).<br/>
                                            A diferença entre as avaliações excedeu 40%.
                                        </>
                                    ) : dropInfo ? (
                                        <>
                                            {dropInfo.text} <span className="text-[#08605F] font-semibold">({Math.round(dropInfo.percent * 10) / 10}%)</span>
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
                <State state={state}/>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
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
}

export default ColaboratorsCommitte;