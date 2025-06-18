import { useState } from "react";
import SearchBar from "../../components/CollaboratorsSearchBar";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import StarRating from "../../components/StarRating";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import EvaluationSummary from "../../components/Committee/EvaluationSummary";
import FilterIcon from '../../assets/committee/filter-icon.png';

function Equalization(){
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [evaluationState, setEvaluationState] = useState<{
        [key: string]: {
            notaFinal?: number;
            justification?: string;
            isEditing: boolean;
        }
    }>({});

    const collaborators = [
        { 
            id: "1", 
            name: "Diogo", 
            role: "PO", 
            initials: "DH", 
            state: "pendente" as const,
            autoAvaliacao: 4.2,
            avaliacao360: 3.8,
            notaGestor: 4.5
        },
        { 
            id: "2", 
            name: "João", 
            role: "Dev", 
            initials: "JS", 
            state: "finalizado" as const,
            autoAvaliacao: 4.5,
            avaliacao360: 4.2,
            notaGestor: 4.8,
            notaFinal: 4.5
        },
        { 
            id: "3", 
            name: "Maria", 
            role: "QA", 
            initials: "MS", 
            state: "pendente" as const,
            autoAvaliacao: 2.8,
            avaliacao360: 3.2,
            notaGestor: 3.0
        },
    ];

    const handleStarRating = (collabId: string, score: number) => {
        setEvaluationState(prev => ({
            ...prev,
            [collabId]: {
                ...prev[collabId],
                notaFinal: score
            }
        }));
    };

    const handleJustification = (collabId: string, text: string) => {
        setEvaluationState(prev => ({
            ...prev,
            [collabId]: {
                ...prev[collabId],
                justification: text
            }
        }));
    };

    const handleConcluir = (collabId: string) => {
        setEvaluationState(prev => ({
            ...prev,
            [collabId]: {
                ...prev[collabId],
                isEditing: false
            }
        }));
    };

    const handleEdit = (collabId: string) => {
        setEvaluationState(prev => ({
            ...prev,
            [collabId]: {
                ...prev[collabId],
                isEditing: true
            }
        }));
    };

    const handleDownload = (collabId: string) => {
        // Implement download logic here
        console.log('Downloading evaluation for:', collabId);
    };

    return(
        <div className="flex w-full h-screen">
            <div className="w-[15%] bg-white-200"> {/* //navbar ao lado */}
                <h1>Nav bar ao lado</h1>
            </div>
            <div className="w-[85%] bg-gray-300">
                <div className="bg-white w-full h-[15%] p-6 box-border border border-gray-300">
                    <h1 className="text-left mb-6 mt-6 ml-4 text-2xl font-semibold text-gray-800">
                        Equalizações
                    </h1>
                </div>
                <div className="p-6">
                    {/* DIV GERAL*/}
                    <div className="flex items-center justify-between mb-6">
                        <SearchBar />
                        <div className="w-12 h-12 bg-[#08605F] rounded-lg ml-4 flex items-center justify-center">
                            <img 
                                src={FilterIcon}
                                alt="Ícone Filtro"
                                className="w-5 h-5 hover:scale-105 transition-transform"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* colaboradores */}
                        {collaborators.map((collab) => (
                            <div key={collab.id} className="bg-white rounded-lg shadow-md">
                                <div className="p-4">
                                    <div className="flex items-center">
                                        <div className="w-[95%]">
                                            <Colaborators 
                                                name={collab.name}
                                                role={collab.role}
                                                initials={collab.initials}
                                                state={collab.state}
                                                autoAvaliacao={collab.autoAvaliacao}
                                                avaliacao360={collab.avaliacao360}
                                                notaGestor={collab.notaGestor}
                                                notaFinal={collab.notaFinal}
                                            />
                                        </div>
                                        <div className="w-[5%] flex justify-center">
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
                                            <div className="mb-6">
                                                <EvaluationSummary 
                                                    name={collab.name}
                                                    role={collab.role}                                                
                                                    autoAvaliacao={collab.autoAvaliacao}
                                                    avaliacao360={collab.avaliacao360}
                                                    notaGestor={collab.notaGestor}
                                                    notaFinal={evaluationState[collab.id]?.notaFinal ?? collab.notaFinal}
                                                    onEdit={() => handleEdit(collab.id)}
                                                    onDownload={() => handleDownload(collab.id)}
                                                />
                                            </div>
                                            
                                            {evaluationState[collab.id]?.isEditing && (
                                                <>
                                                    <div className="mb-6">
                                                        <h3 className="text-sm mb-2">Dê uma avaliação de 1 à 5</h3>
                                                        <StarRating 
                                                            score={evaluationState[collab.id]?.notaFinal || 0} 
                                                            onChange={(score) => handleStarRating(collab.id, score)} 
                                                        />
                                                    </div>
                                                    
                                                    <div className="mb-6">
                                                        <h3 className="text-sm font-semibold mb-2">Justifique sua nota</h3>
                                                        <textarea 
                                                            className="text-sm w-full p-2 border border-gray-300 rounded-mb focus:outline-none focus:ring-2 focus:ring-[#08605F]"
                                                            rows={4}
                                                            placeholder="Justifique sua nota"
                                                            value={evaluationState[collab.id]?.justification || ''}
                                                            onChange={(e) => handleJustification(collab.id, e.target.value)}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex justify-end">
                                                        <button 
                                                            className="bg-[#08605F] text-white px-6 py-2 rounded-md hover:bg-[#064a49] transition-colors"
                                                            onClick={() => handleConcluir(collab.id)}
                                                        >
                                                            Concluir
                                                        </button>
                                                    </div>
                                                </>
                                            )}
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