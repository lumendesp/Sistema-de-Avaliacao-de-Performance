import { useState, useEffect, useMemo } from "react";
import SearchBar from "../../components/CollaboratorsSearchBar";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import EvaluationSummary from "../../components/Committee/EvaluationSummary";
import FilterIcon from '../../assets/committee/filter-icon.png';
import { getUsersWithEvaluations, createFinalEvaluation } from "../../services/api";

// Enums manually mirrored from backend
const EvaluationStatus = {
    PENDING: 'PENDING',
    FINALIZED: 'FINALIZED',
    EXPIRED: 'EXPIRED',
} as const;

const EvaluationType = {
    SELF: 'SELF',
    MANAGER: 'MANAGER',
    PEER: 'PEER',
    FINAL: 'FINAL',
} as const;

interface Collaborator {
    id: number;
    name: string;
    role: string;
    initials: string;
    state: 'pendente' | 'finalizado' | 'expirado';
    autoAvaliacao: number;
    avaliacao360: number;
    notaGestor: number;
    notaFinal?: number;
    finalEvaluationId?: number;
    justification?: string;
    justificativaAutoAvaliacao?: string;
    justificativaGestor?: string;
    justificativa360?: string;
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

    const filteredCollaborators = useMemo(() => {
        if (!searchTerm) {
            return collaborators;
        }
        return collaborators.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [collaborators, searchTerm]);

    const fetchCollaborators = async () => {
        try {
            const users = await getUsersWithEvaluations();
            const formattedCollaborators = users.map((user: any) => {
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

                // Determine state based on having all 3 evaluations (PEER, MANAGER, FINAL)
                // Note: SELF evaluation is not in the current schema
                const hasAllEvaluations = user.hasAllEvaluations || evaluations.length >= 3;
                const state = hasAllEvaluations ? 'finalizado' : 'pendente';

                return {
                    id: user.id,
                    name: user.name,
                    role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
                    initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                    state: state,
                    autoAvaliacao: 0, // SELF evaluation not available in current schema
                    avaliacao360: getScore('PEER'),
                    notaGestor: getScore('MANAGER'),
                    notaFinal: finalEval ? finalEval.score : undefined,
                    finalEvaluationId: finalEval ? finalEval.id : undefined,
                    justification: finalEval ? finalEval.justification : '',
                    justificativaAutoAvaliacao: '', // SELF evaluation not available in current schema
                    justificativaGestor: getJustification('MANAGER'),
                    justificativa360: getJustification('PEER'),
                };
            });
            setCollaborators(formattedCollaborators);
        } catch (error) {
            console.error("Failed to fetch collaborators:", error);
        }
    };

    useEffect(() => {
        fetchCollaborators();
    }, []);

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

        // The evaluatorId should come from the logged-in user context in a real app
        // For now, we'll use the committee member ID from the seed data
        const evaluatorId = 5; // Eve is the committee member (ID 5)

        const evaluationData = {
            score: currentEvaluation.notaFinal,
            justification: currentEvaluation.justification || '',
            evaluateeId: collabId,
            evaluatorId: evaluatorId,
        };

        try {
            // For this page, we are always creating a *new* final evaluation
            const newFinalEvaluation = await createFinalEvaluation(evaluationData);
            
            // Refresh the data to get updated status
            await fetchCollaborators();
            
            setEvaluationState(prev => ({
                ...prev,
                [collabId]: { ...prev[collabId], isEditing: false }
            }));

        } catch (error) {
            console.error("Failed to save evaluation:", error);
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
            <div className="w-full bg-gray-300 min-h-full">
                <div className="bg-white w-full min-h-[15%] p-4 box-border border border-gray-300">
                    <h1 className="text-left mb-4 mt-4 ml-2 sm:ml-4 text-xl sm:text-2xl font-semibold text-gray-800">
                        Equalizações
                    </h1>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-6 gap-4">
                        <div className="flex-1">
                            <SearchBar onSearch={setSearchTerm} />
                        </div>
                        <div className="w-12 h-12 bg-[#08605F] rounded-lg flex items-center justify-center self-center sm:self-auto">
                            <img 
                                src={FilterIcon}
                                alt="Ícone Filtro"
                                className="w-5 h-5 hover:scale-105 transition-transform"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[60vh] sm:max-h-[68vh] overflow-y-auto pr-2">
                        {filteredCollaborators.map((collab) => (
                            <div key={collab.id} className="bg-white rounded-lg shadow-md">
                                <div className="p-4">
                                    <div className="flex items-center">
                                        <div className="w-[90%] sm:w-[95%]">
                                            <Colaborators 
                                                name={collab.name}
                                                role={collab.role}
                                                initials={collab.initials}
                                                state={collab.state}
                                                autoAvaliacao={collab.autoAvaliacao}
                                                avaliacao360={collab.avaliacao360}
                                                notaGestor={collab.notaGestor}
                                                notaFinal={evaluationState[collab.id]?.notaFinal ?? collab.notaFinal}
                                            />
                                        </div>
                                        <div className="w-[10%] sm:w-[5%] flex justify-center">
                                            <button 
                                                onClick={() => setExpandedId(expandedId === collab.id ? null : collab.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                            >
                                                {expandedId === collab.id ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {expandedId === collab.id && (
                                        <div className="mt-4 p-4 border-t border-gray-200">
                                            <EvaluationSummary 
                                                id={String(collab.id)}
                                                name={collab.name}
                                                role={collab.role}                                                
                                                autoAvaliacao={collab.autoAvaliacao}
                                                avaliacao360={collab.avaliacao360}
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
                                                justificativaGestor={collab.justificativaGestor}
                                                justificativa360={collab.justificativa360}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Equalization;