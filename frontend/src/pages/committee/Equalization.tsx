import { useState, useEffect, useMemo } from "react";
import { IoIosSearch } from "react-icons/io";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import EvaluationSummary from "../../components/Committee/CommitteeEquali/EvaluationSummary";
import FilterIcon from '../../assets/committee/filter-icon.png';
import { createFinalScore, updateFinalScore, getUsersWithEvaluationsForCommittee, fetchActiveEvaluationCycle, getSignificantDrops } from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import { translateRole } from '../../utils/roleTranslations';

interface Collaborator {
    id: number;
    name: string;
    role: string;
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
    const [searchParams] = useSearchParams();

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
            
            const formattedCollaborators = await Promise.all(users.map(async (user: any) => {
                const evaluations = user.evaluationsEvaluated || [];
                
                const getScore = (type: string): number => {
                    const evalData = evaluations.find((e: any) => e.type === type);
                    return evalData ? evalData.score : 0;
                };

                const getJustification = (type: string): string => {
                    const evalData = evaluations.find((e: any) => e.type === type);
                    return evalData ? evalData.justification || '' : '';
                };

                const finalEval = evaluations.find((e: any) => e.type === 'FINAL');

                // Determine state based on having all 4 required evaluation types
                const requiredTypes = ['SELF', 'PEER', 'MANAGER', 'FINAL'];
                const typesPresent = evaluations.map((e: any) => e.type);
                const hasAllEvaluations = requiredTypes.every(type => typesPresent.includes(type));
                const state = hasAllEvaluations ? 'finalizado' : 'pendente';

                // Fetch significant drops if we have an active cycle
                let dropInfo = undefined;
                if (activeCycle?.id) {
                    try {
                        const dropData = await getSignificantDrops(user.id, activeCycle.id);
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

                return {
                    id: user.id,
                    name: user.name,
                    role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
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
                    cycleId: activeCycle?.id || 0,
                    dropInfo: dropInfo,
                };
            }));
            
            setCollaborators(formattedCollaborators);
        } catch (error) {
            console.error("Failed to fetch collaborators:", error);
        }
    };

    const fetchActiveCycle = async () => {
        try {
            const cycle = await fetchActiveEvaluationCycle();
            setActiveCycle(cycle);
        } catch (error) {
            console.error("Failed to fetch active cycle:", error);
        }
    };

    useEffect(() => {
        fetchActiveCycle();
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
        <div className="w-full min-h-screen">
            <div className="w-full bg-[#f1f1f1] min-h-full">
                <div className="bg-white w-full min-h-[15%] p-2 sm:p-4 box-border border border-gray-300">
                    <h1 className="text-left mb-2 sm:mb-4 mt-2 sm:mt-4 ml-1 sm:ml-4 text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                        Equalizações
                    </h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-1 sm:gap-2 rounded-xl py-2 sm:py-4 px-3 sm:px-7 w-full bg-gray-100">
                                <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
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
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#08605F] rounded-lg flex items-center justify-center self-center sm:self-auto">
                            <img 
                                src={FilterIcon}
                                alt="Ícone Filtro"
                                className="w-5 h-5 hover:scale-105 transition-transform"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-2 sm:p-6">
                    <div className="space-y-2 sm:space-y-4 max-h-[60vh] sm:max-h-[68vh] overflow-x-auto pr-1 sm:pr-2">
                        {filteredCollaborators.map((collab) => (
                            <div key={collab.id} className="bg-white rounded-lg shadow-md min-w-[260px] sm:min-w-0">
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
                                        <div className="mt-2 sm:mt-4 p-2 sm:p-4 border-t border-gray-200">
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
                </div>
            </div>
        </div>
    )
}

export default Equalization;