import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { getUsersWithEvaluationsForCommittee, getClosedCycles } from '../../services/api';
import { UserIcon } from '../../components/UserIcon';
import { saveAs } from 'file-saver';

function History() {
    const [closedCycles, setClosedCycles] = useState<any[]>([]);
    const [selectedHistoryCycle, setSelectedHistoryCycle] = useState<any>(null);
    const [historyCollaborators, setHistoryCollaborators] = useState<any[]>([]);
    const [historySearch, setHistorySearch] = useState('');
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        getClosedCycles().then(setClosedCycles);
    }, []);

    useEffect(() => {
        const fetchHistoryCollaborators = async () => {
            if (!selectedHistoryCycle) return;
            setHistoryLoading(true);
            try {
                const users = await getUsersWithEvaluationsForCommittee();
                const formatted = await Promise.all(users.map(async (user: any) => {
                    const evaluations = user.evaluationsEvaluated || [];
                    const cycleEvaluations = evaluations.filter((e: any) => e.cycle && e.cycle.id === selectedHistoryCycle.id);
                    if (cycleEvaluations.length === 0) return null;
                    const getScore = (type: string): number => {
                        const evalData = cycleEvaluations.find((e: any) => e.type === type);
                        return evalData ? evalData.score : 0;
                    };
                    const finalEval = cycleEvaluations.find((e: any) => e.type === 'FINAL');
                    return {
                        id: user.id,
                        name: user.name,
                        role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
                        initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                        notaFinal: finalEval ? finalEval.score : undefined,
                        cycleId: selectedHistoryCycle.id,
                    };
                }));
                setHistoryCollaborators(formatted.filter(Boolean));
            } finally {
                setHistoryLoading(false);
            }
        };
        if (selectedHistoryCycle) fetchHistoryCollaborators();
    }, [selectedHistoryCycle]);

    // Helper function to export CSV for history, matching Equalization export
    function exportHistoryToCSV(data: any[], cycleName: string) {
        if (!data.length) return;
        // Match the export format from Equalization
        const header = ['Nome', 'Nota Final', 'Ciclo'];
        const rows = data.map(row => [row.name, (Math.round(row.notaFinal * 10) / 10), cycleName]);
        const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `historico_equalizacao_${cycleName}.csv`);
    }

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
                            <option value="">Selecione um ciclo</option>
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
                    {selectedHistoryCycle && (
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => exportHistoryToCSV(historyCollaborators.map(c => ({ nome: c.name, notaFinal: c.notaFinal, ciclo: selectedHistoryCycle.name })), selectedHistoryCycle.name)}>Exportar CSV</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-2 sm:p-6">
                {!selectedHistoryCycle ? (
                    <div className="text-center text-gray-500 py-8 text-base">
                        <p>Selecione um ciclo para ver o histórico de equalizações.</p>
                    </div>
                ) : historyLoading ? (
                    <div className="text-center text-gray-500 py-8 text-base">Carregando...</div>
                ) : (
                    <div className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-[68vh] overflow-x-auto pr-1 sm:pr-2">
                        {historyCollaborators.filter(c => c.name.toLowerCase().includes(historySearch.toLowerCase())).map(collab => (
                            <div key={collab.id} className="bg-white rounded-lg shadow-md min-w-[260px] sm:min-w-0 p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <UserIcon initials={collab.initials} size={32} />
                                    <div>
                                        <div className="font-semibold text-gray-800">{collab.name}</div>
                                        <div className="text-xs text-gray-500">{collab.role}</div>
                                    </div>
                                    <div className="ml-auto font-bold text-green-700 text-lg">{collab.notaFinal !== undefined ? (Math.round(collab.notaFinal * 10) / 10) : '-'}</div>
                                </div>
                                {/* You can add more details here if needed */}
                            </div>
                        ))}
                        {historyCollaborators.length === 0 && (
                            <div className="text-center text-gray-500 py-4 sm:py-8 text-xs sm:text-base">
                                Nenhum colaborador encontrado para este ciclo
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
