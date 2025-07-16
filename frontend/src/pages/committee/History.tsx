import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { getUsersWithEvaluationsForCommittee, getClosedCycles } from '../../services/api';
import { UserIcon } from '../../components/UserIcon';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import EvaluationSummary from "../../components/Committee/CommitteeEquali/EvaluationSummary";
import { exportEvaluationToExcel, exportEvaluationToCSV, transformBackendDataToExport } from '../../services/export.service';

function History() {
    const [closedCycles, setClosedCycles] = useState<any[]>([]);
    const [selectedHistoryCycle, setSelectedHistoryCycle] = useState<any>(null);
    const [historyCollaborators, setHistoryCollaborators] = useState<any[]>([]);
    const [historySearch, setHistorySearch] = useState('');
    const [historyLoading, setHistoryLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [allCyclesData, setAllCyclesData] = useState<any[]>([]);

    useEffect(() => {
        getClosedCycles().then(setClosedCycles);
    }, []);

    useEffect(() => {
        const fetchHistoryCollaborators = async () => {
            setHistoryLoading(true);
            try {
                const users = await getUsersWithEvaluationsForCommittee();
                if (selectedHistoryCycle) {
                    // Only show users for the selected cycle
                    const formatted = await Promise.all(users.map(async (user: any) => {
                        const evaluations = user.evaluationsEvaluated || [];
                        const cycleEvaluations = evaluations.filter((e: any) => e.cycle && e.cycle.id === selectedHistoryCycle.id);
                        if (cycleEvaluations.length === 0) return null;
                        const getScore = (type: string): number => {
                            const evalData = cycleEvaluations.find((e: any) => e.type === type);
                            return evalData ? evalData.score : 0;
                        };
                        const getJustification = (type: string): string => {
                            const evalData = cycleEvaluations.find((e: any) => e.type === type);
                            return evalData ? evalData.justification || '' : '';
                        };
                        const finalEval = cycleEvaluations.find((e: any) => e.type === 'FINAL');
                        return {
                            id: user.id,
                            name: user.name,
                            role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
                            initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                            autoAvaliacao: getScore('SELF'),
                            avaliacao360: getScore('PEER'),
                            notaMentor: getScore('MENTOR'),
                            notaGestor: getScore('MANAGER'),
                            notaFinal: finalEval ? finalEval.score : undefined,
                            justification: finalEval ? finalEval.justification : '',
                            justificativaAutoAvaliacao: getJustification('SELF'),
                            justificativaMentor: getJustification('MENTOR'),
                            justificativaGestor: getJustification('MANAGER'),
                            justificativa360: getJustification('PEER'),
                            cycleId: selectedHistoryCycle.id,
                            backendData: finalEval,
                            roleRaw: user.roles,
                        };
                    }));
                    setHistoryCollaborators(formatted.filter(Boolean));
                } else {
                    // Show all cycles grouped with their users
                    const cyclesMap: { [cycleId: number]: { cycle: any, users: any[] } } = {};
                    users.forEach((user: any) => {
                        const evaluations = user.evaluationsEvaluated || [];
                        const cycles = Array.from(new Set(evaluations.filter((e: any) => e.cycle).map((e: any) => e.cycle.id)));
                        cycles.forEach((cycleId: any) => {
                            const cycle = evaluations.find((e: any) => e.cycle && e.cycle.id === cycleId)?.cycle;
                            if (!cycle) return;
                            if (!cyclesMap[cycleId]) cyclesMap[cycleId] = { cycle, users: [] };
                            const cycleEvaluations = evaluations.filter((e: any) => e.cycle && e.cycle.id === cycleId);
                            const getScore = (type: string): number => {
                                const evalData = cycleEvaluations.find((e: any) => e.type === type);
                                return evalData ? evalData.score : 0;
                            };
                            const getJustification = (type: string): string => {
                                const evalData = cycleEvaluations.find((e: any) => e.type === type);
                                return evalData ? evalData.justification || '' : '';
                            };
                            const finalEval = cycleEvaluations.find((e: any) => e.type === 'FINAL');
                            cyclesMap[cycleId].users.push({
                                id: user.id,
                                name: user.name,
                                role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
                                initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                                autoAvaliacao: getScore('SELF'),
                                avaliacao360: getScore('PEER'),
                                notaMentor: getScore('MENTOR'),
                                notaGestor: getScore('MANAGER'),
                                notaFinal: finalEval ? finalEval.score : undefined,
                                justification: finalEval ? finalEval.justification : '',
                                justificativaAutoAvaliacao: getJustification('SELF'),
                                justificativaMentor: getJustification('MENTOR'),
                                justificativaGestor: getJustification('MANAGER'),
                                justificativa360: getJustification('PEER'),
                                cycleId: cycleId,
                                backendData: finalEval,
                                roleRaw: user.roles,
                            });
                        });
                    });
                    // Sort cycles by end date descending
                    const allCycles = Object.values(cyclesMap).sort((a, b) => new Date(b.cycle.endDate).getTime() - new Date(a.cycle.endDate).getTime());
                    setAllCyclesData(allCycles);
                }
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistoryCollaborators();
    }, [selectedHistoryCycle]);

    // Filter function for search
    const filterUsers = (users: any[]) => users.filter(c => c.name.toLowerCase().includes(historySearch.toLowerCase()));

    return (
        <div className="w-full min-h-screen bg-[#f1f1f1]">
            <div className="bg-white w-full min-h-[15%] p-2 sm:p-4 box-border border border-gray-300">
                <h1 className="text-left mb-2 sm:mb-4 mt-2 sm:mt-4 ml-1 sm:ml-4 text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                    Histórico de Equalizações
                </h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                    <div className="flex-1 flex gap-2">
                        <select className="p-2 rounded-lg border text-sm text-gray-700 bg-white" value={selectedHistoryCycle?.id || ''} onChange={e => {
                            const cycle = closedCycles.find(c => c.id === Number(e.target.value));
                            setSelectedHistoryCycle(cycle);
                        }}>
                            <option value="">Todos os ciclos</option>
                            {closedCycles.map(cycle => (
                                <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-1 sm:gap-2 rounded-xl py-2 sm:py-4 px-3 sm:px-7 w-full bg-gray-100">
                            <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
                            <input
                                type="text"
                                placeholder="Buscar colaborador"
                                className="flex-1 outline-none text-xs sm:text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
                                value={historySearch}
                                onChange={e => setHistorySearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-1 sm:p-6">
                {historyLoading ? (
                    <div className="text-center text-gray-500 py-8 text-base">Carregando...</div>
                ) : selectedHistoryCycle ? (
                    <div className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-[68vh] overflow-x-auto pr-1 sm:pr-2">
                        {filterUsers(historyCollaborators).map(collab => (
                            <div key={collab.id} className="bg-white rounded-lg shadow-md min-w-[90vw] sm:min-w-0 max-w-full mx-auto">
                                <div className="p-2 sm:p-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 "
                                        onClick={() => setExpandedId(expandedId === collab.id ? null : collab.id)}
                                    >
                                        <div className="w-full">
                                            <div className="flex items-center gap-3">
                                                <UserIcon initials={collab.initials} size={32} />
                                                <div>
                                                    <div className="font-semibold text-gray-800">{collab.name}</div>
                                                    <div className="text-xs text-gray-500">{collab.role}</div>
                                                </div>
                                                <div className="ml-auto font-bold text-green-700 text-lg">{collab.notaFinal !== undefined ? (Math.round(collab.notaFinal * 10) / 10) : '-'}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-center w-full sm:w-[2%]">
                                            <button
                                                onClick={e => { e.stopPropagation(); setExpandedId(expandedId === collab.id ? null : collab.id); }}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                            >
                                                {expandedId === collab.id ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedId === collab.id && (
                                        <div className="mt-2 sm:mt-4 p-1 sm:p-4 border-t border-gray-200">
                                            <EvaluationSummary
                                                userId={collab.id}
                                                name={collab.name}
                                                role={collab.role}
                                                autoAvaliacao={collab.autoAvaliacao}
                                                avaliacao360={collab.avaliacao360}
                                                notaMentor={collab.notaMentor}
                                                notaGestor={collab.notaGestor}
                                                notaFinal={collab.notaFinal}
                                                currentScore={collab.notaFinal ?? 0}
                                                currentJustification={collab.justification ?? ''}
                                                isEditing={false}
                                                justificativaAutoAvaliacao={collab.justificativaAutoAvaliacao}
                                                justificativaMentor={collab.justificativaMentor}
                                                justificativaGestor={collab.justificativaGestor}
                                                justificativa360={collab.justificativa360}
                                                backendData={collab}
                                                cycleId={collab.cycleId}
                                                onEdit={undefined} // Hide edit button
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {historyCollaborators.length === 0 && (
                            <div className="text-center text-gray-500 py-4 sm:py-8 text-xs sm:text-base">
                                Nenhum colaborador encontrado para este ciclo
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {allCyclesData.map(({ cycle, users }) => (
                            <div key={cycle.id}>
                                <h2 className="text-lg font-bold text-[#08605F] mb-2">{cycle.name}</h2>
                                <div className="space-y-2">
                                    {filterUsers(users).map(collab => (
                                        <div key={collab.id} className="bg-white rounded-lg shadow-md min-w-[90vw] sm:min-w-0 max-w-full mx-auto">
                                            <div className="p-2 sm:p-4">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 "
                                                    onClick={() => setExpandedId(expandedId === collab.id ? null : collab.id)}
                                                >
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-3">
                                                            <UserIcon initials={collab.initials} size={32} />
                                                            <div>
                                                                <div className="font-semibold text-gray-800">{collab.name}</div>
                                                                <div className="text-xs text-gray-500">{collab.role}</div>
                                                            </div>
                                                            <div className="ml-auto font-bold text-green-700 text-lg">{collab.notaFinal !== undefined ? (Math.round(collab.notaFinal * 10) / 10) : '-'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-center w-full sm:w-[2%]">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); setExpandedId(expandedId === collab.id ? null : collab.id); }}
                                                            className="p-2 hover:bg-gray-100 rounded-full"
                                                        >
                                                            {expandedId === collab.id ? <FaChevronUp /> : <FaChevronDown />}
                                                        </button>
                                                    </div>
                                                </div>
                                                {expandedId === collab.id && (
                                                    <div className="mt-2 sm:mt-4 p-1 sm:p-4 border-t border-gray-200">
                                                        <EvaluationSummary
                                                            userId={collab.id}
                                                            name={collab.name}
                                                            role={collab.role}
                                                            autoAvaliacao={collab.autoAvaliacao}
                                                            avaliacao360={collab.avaliacao360}
                                                            notaMentor={collab.notaMentor}
                                                            notaGestor={collab.notaGestor}
                                                            notaFinal={collab.notaFinal}
                                                            currentScore={collab.notaFinal ?? 0}
                                                            currentJustification={collab.justification ?? ''}
                                                            isEditing={false}
                                                            justificativaAutoAvaliacao={collab.justificativaAutoAvaliacao}
                                                            justificativaMentor={collab.justificativaMentor}
                                                            justificativaGestor={collab.justificativaGestor}
                                                            justificativa360={collab.justificativa360}
                                                            backendData={collab}
                                                            cycleId={collab.cycleId}
                                                            onEdit={undefined} // Hide edit button
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {allCyclesData.length === 0 && (
                            <div className="text-center text-gray-500 py-4 sm:py-8 text-xs sm:text-base">
                                Nenhum colaborador encontrado
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
