import { useState, useEffect, useMemo } from "react";
import { IoIosSearch } from "react-icons/io";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import EvaluationSummary from "../../components/Committee/CommitteeEquali/EvaluationSummary";
import FilterIcon from '../../assets/committee/filter-icon.png';
import { createFinalScore, updateFinalScore, getUsersWithEvaluationsForCommittee, fetchCommitteeEqualizationCycle, getSignificantDrops, getClosedCycles } from '../../services/api';
import { exportEvaluationToExcel, exportEvaluationToCSV, transformBackendDataToExport } from '../../services/export.service';
import { useSearchParams } from 'react-router-dom';
import { translateRole } from '../../utils/roleTranslations';
import { UserIcon } from '../../components/UserIcon';
import { saveAs } from 'file-saver';
import { useAuth } from '../../context/AuthContext';

interface Collaborator {
    id: number;
    name: string;
    role: string;
    roleRaw?: any[]; // Add roleRaw to interface
    initials: string;
    state: 'pendente' | 'finalizado' | 'expirado';
    autoAvaliacao: number;
    avaliacao360: number;
    notaGestor: number;
    notaMentor: number;
    notaFinal?: number;
    finalEvaluationId?: number;
    justification?: string;
    justificativaAutoAvaliacao?: string;
    justificativaMentor?: string;
    justificativaGestor?: string;
    justificativa360?: string;
    cycleId: number;
    dropInfo?: { text: string; percent: number };
}

function Equalization(){
    const { user } = useAuth();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [evaluationState, setEvaluationState] = useState<{
        [key: number]: {
            notaFinal?: number;
            justification?: string;
            isEditing: boolean;
        }
    }>({});

    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCycle, setActiveCycle] = useState<any>(null);
    const [cycleId, setCycleId] = useState<number | null>(null);
    const [noActiveCycle, setNoActiveCycle] = useState(false);
    const [searchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState<'equalization' | 'history'>('equalization');
    const [closedCycles, setClosedCycles] = useState<any[]>([]);
    const [selectedHistoryCycle, setSelectedHistoryCycle] = useState<any>(null);
    const [historyCollaborators, setHistoryCollaborators] = useState<Collaborator[]>([]);
    const [historySearch, setHistorySearch] = useState('');
    const [historyLoading, setHistoryLoading] = useState(false);

    const filteredCollaborators = useMemo(() => {
        if (!searchTerm) {
            return collaborators;
        }
        const searchLower = searchTerm.toLowerCase();
        const filtered = collaborators.filter(c => 
            c.name.toLowerCase().includes(searchLower) ||
            c.role.toLowerCase().includes(searchLower)
        );
        console.log('Search term:', searchTerm, 'Total collaborators:', collaborators.length, 'Filtered:', filtered.length);
        return filtered;
    }, [collaborators, searchTerm]);

    const fetchCollaborators = async () => {
        try {
            const users = await getUsersWithEvaluationsForCommittee();
            // Filter out the logged-in user
            const filteredUsers = user ? users.filter((u: any) => u.id !== user.id) : users;
            const formattedCollaborators = await Promise.all(filteredUsers.map(async (user: any) => {
                const evaluations = user.evaluationsEvaluated || [];
                // Only include evaluations for the current committee cycle
                const cycleEvaluations = cycleId
                    ? evaluations.filter((e: any) => e.cycle && e.cycle.id === cycleId)
                    : evaluations;
                const getScore = (type: string): number => {
                    const evalData = cycleEvaluations.find((e: any) => e.type === type);
                    return evalData ? evalData.score : 0;
                };
                const getJustification = (type: string): string => {
                    const evalData = cycleEvaluations.find((e: any) => e.type === type);
                    return evalData ? evalData.justification || '' : '';
                };
                const finalEval = cycleEvaluations.find((e: any) => e.type === 'FINAL');
                // Determine state based on having all 4 required evaluation types
                const requiredTypes = ['SELF', 'PEER', 'MANAGER', 'FINAL'];
                const typesPresent = cycleEvaluations.map((e: any) => e.type);
                const hasAllEvaluations = requiredTypes.every(type => typesPresent.includes(type));
                const state = hasAllEvaluations ? 'finalizado' : 'pendente';
                // Fetch significant drops if we have an active cycle
                let dropInfo = undefined;
                if (cycleId) {
                    try {
                        const dropData = await getSignificantDrops(user.id, cycleId);
                        if (dropData) {
                            dropInfo = {
                                text: dropData.message,
                                percent: dropData.dropPercent
                            };
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch drops for user ${user.id}:`, error);
                    }
                }
                // Only include users who have at least one evaluation in this cycle
                if (cycleEvaluations.length === 0) return null;
                return {
                    id: user.id,
                    name: user.name,
                    role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
                    roleRaw: user.roles, // Store raw roles for tooltip
                    initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                    state: state,
                    autoAvaliacao: getScore('SELF'),
                    avaliacao360: getScore('PEER'),
                    notaMentor: getScore('MENTOR'),
                    notaGestor: getScore('MANAGER'),
                    notaFinal: finalEval ? finalEval.score : undefined,
                    finalEvaluationId: finalEval ? finalEval.id : undefined,
                    justification: finalEval ? finalEval.justification : '',
                    justificativaAutoAvaliacao: getJustification('SELF'),
                    justificativaMentor: getJustification('MENTOR'),
                    justificativaGestor: getJustification('MANAGER'),
                    justificativa360: getJustification('PEER'),
                    cycleId: cycleId || 0,
                    dropInfo: dropInfo,
                };
            }));
            setCollaborators(formattedCollaborators.filter(Boolean));
        } catch (error) {
            console.error("Failed to fetch collaborators:", error);
        }
    };

    const fetchCommitteeCycle = async () => {
        try {
            // Fetch the active committee cycle
            const cycle = await fetchCommitteeEqualizationCycle();
            setActiveCycle(cycle);
            setCycleId(cycle?.id || null);
            setNoActiveCycle(false);
        } catch (error) {
            console.error("Failed to fetch committee equalization cycle:", error);
            setNoActiveCycle(true);
            setActiveCycle(null);
            setCycleId(null);
        }
    };

    useEffect(() => {
        fetchCommitteeCycle();
    }, []);

    useEffect(() => {
        if (activeCycle) {
            fetchCollaborators();
        }
    }, [activeCycle]);

    useEffect(() => {
        // On mount, check for expand param
        const expandId = searchParams.get('expand');
        if (expandId) {
            setExpandedId(Number(expandId));
        }
    }, [searchParams]);

    // Remove all history-related useEffects and UI

    // Fetch AI summary for a user and cycle
    const fetchAISummary = async (userId: number, cycleId: number) => {
        try {
            const res = await fetch(`/ai-summary?userId=${userId}&cycleId=${cycleId}`);
            if (!res.ok) return null;
            return await res.text();
        } catch {
            return null;
        }
    };

    const handleStarRating = (collabId: number, score: number) => {
        setEvaluationState(prev => ({
            ...prev,
            [collabId]: {
                ...prev[collabId],
                notaFinal: score,
                isEditing: true,
            }
        }));
    };

    const handleJustification = (collabId: number, text: string) => {
        setEvaluationState(prev => ({
            ...prev,
            [collabId]: {
                ...prev[collabId],
                justification: text,
                isEditing: true,
            }
        }));
    };

    const handleConcluir = async (collabId: number) => {
        const currentEvaluation = evaluationState[collabId];
        const collaborator = collaborators.find(c => c.id === collabId);

        if (!collaborator || currentEvaluation?.notaFinal === undefined) return;

        try {
            if (collaborator.finalEvaluationId) {
                // Update existing final evaluation
                await updateFinalScore(collaborator.finalEvaluationId, {
                    finalScore: currentEvaluation.notaFinal,
                    justification: currentEvaluation.justification || '',
                });
            } else {
                // Create new final evaluation
                await createFinalScore({
                    userId: collabId,
                    finalScore: currentEvaluation.notaFinal,
                    justification: currentEvaluation.justification || '',
                    cycleId: collaborator.cycleId
                });
            }

            // Refresh data
            await fetchCollaborators();
            
            // Update local state
            setEvaluationState(prev => ({
                ...prev,
                [collabId]: { ...prev[collabId], isEditing: false }
            }));

        } catch (error) {
            console.error('Error saving final evaluation:', error);
            alert(error instanceof Error ? error.message : 'Erro ao salvar avaliação final');
        }
    };

    const handleEdit = (collabId: number) => {
        const collab = collaborators.find(c => c.id === collabId);
        setEvaluationState(prev => ({
            ...prev,
            [collabId]: {
                notaFinal: collab?.notaFinal || 0,
                justification: collab?.justification || '',
                isEditing: true
            }
        }));
    };

    const handleDownload = (collabId: number) => {
        console.log('Downloading evaluation for:', collabId);
    };

    return(
        <div className="w-full min-h-screen bg-[#f1f1f1]">
            <div className="w-full min-h-full">
                <div className="bg-white w-full min-h-[15%] p-2 sm:p-4 box-border border border-gray-300">
                    <h1 className="text-left mb-2 sm:mb-4 mt-2 sm:mt-4 ml-1 sm:ml-4 text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                        Equalizações
                    </h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-1 sm:gap-2 rounded-xl py-2 sm:py-4 px-2 sm:px-7 w-full bg-gray-100">
                                <IoIosSearch size={18} className="text-[#1D1D1D]/75" />
                                <input
                                    type="text"
                                    placeholder="Buscar por colaboradores"
                                    className="flex-1 outline-none text-xs sm:text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Only render equalization UI, remove history UI */}
                <div className="p-1 sm:p-6">
                    {noActiveCycle ? (
                        <div className="text-center text-gray-500 py-8 text-base">
                            <p className="mb-2">Nenhum ciclo de equalização disponível.</p>
                            <p className="text-sm">Aguarde o fechamento do ciclo de avaliação e sua liberação para o comitê. As avaliações estarão disponíveis para equalização após esse processo.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-[68vh] overflow-x-auto pr-1 sm:pr-2">
                            {filteredCollaborators.map((collab) => (
                                <div key={collab.id} className="bg-white rounded-lg shadow-md min-w-[90vw] sm:min-w-0 max-w-full mx-auto">
                                    <div className="p-2 sm:p-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 "
                                        onClick={() => setExpandedId(expandedId === collab.id ? null : collab.id)}
                                        >
                                            <div className="w-full">
                                                <Colaborators 
                                                    name={collab.name}
                                                    role={collab.role
                                                      .split(',')
                                                      .map(r => translateRole(r.trim()))
                                                      .join(', ')}
                                                    roleRaw={collab.roleRaw}
                                                    initials={collab.initials}
                                                    state={collab.state}
                                                    autoAvaliacao={collab.autoAvaliacao}
                                                    avaliacao360={collab.avaliacao360}
                                                    notaGestor={collab.notaGestor}
                                                    notaMentor={collab.notaMentor}
                                                    notaFinal={evaluationState[collab.id]?.notaFinal ?? collab.notaFinal}
                                                    dropInfo={collab.dropInfo}
                                                />
                                            </div>
                                            <div className="flex justify-center w-full sm:w-[2%]">
                                                <button 
                                                    onClick={() => setExpandedId(expandedId === collab.id ? null : collab.id)}
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
                                                    notaFinal={evaluationState[collab.id]?.notaFinal ?? collab.notaFinal}
                                                    onEdit={() => handleEdit(collab.id)}
                                                    onDownload={() => handleDownload(collab.id)}
                                                    onStarRating={(score) => handleStarRating(collab.id, score)}
                                                    onJustification={(text) => handleJustification(collab.id, text)}
                                                    onConcluir={() => handleConcluir(collab.id)}
                                                    currentScore={evaluationState[collab.id]?.notaFinal ?? collab.notaFinal ?? 0}
                                                    currentJustification={evaluationState[collab.id]?.justification ?? collab.justification ?? ''}
                                                    isEditing={evaluationState[collab.id]?.isEditing || false}
                                                    justificativaAutoAvaliacao={collab.justificativaAutoAvaliacao}
                                                    justificativaMentor={collab.justificativaMentor}
                                                    justificativaGestor={collab.justificativaGestor}
                                                    justificativa360={collab.justificativa360}
                                                    backendData={collab}
                                                    cycleId={collab.cycleId}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filteredCollaborators.length === 0 && (
                                <div className="text-center text-gray-500 py-4 sm:py-8 text-xs sm:text-base">
                                    Nenhum colaborador encontrado
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Helper component to fetch and display AI summary
function AsyncAISummary({ userId, cycleId }: { userId: number, cycleId: number }) {
    const [summary, setSummary] = useState<string | null>(null);
    useEffect(() => {
        let mounted = true;
        (async () => {
            const res = await fetch(`/ai-summary?userId=${userId}&cycleId=${cycleId}`);
            if (mounted) setSummary(res.ok ? await res.text() : null);
        })();
        return () => { mounted = false; };
    }, [userId, cycleId]);
    if (summary === null) return <span className="text-gray-400">Carregando resumo...</span>;
    return <span>{summary}</span>;
}

// Helper function to export simple CSV for history
function exportHistoryToCSV(data: any[], cycleName: string) {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `historico_equalizacao_${cycleName}.csv`);
}

// Helper to get display roles (excluding 'Administrador')
function getDisplayRoles(roles: any[]): string[] {
    return roles
        .map((r: any) => translateRole(r.role))
        .filter(role => role !== 'Administrador');
}

export default Equalization;