import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTrash, FaEdit } from 'react-icons/fa';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import EvaluationDropdown from './EvaluationDropdown';

interface Evaluation {
    name: string;
    mandatory: boolean;
    weight: number;
    description: string;
}

interface Criterion {
    name: string;
    evaluations: Evaluation[];
}

interface AvailableCriterion {
    id: number;
    name: string;
    displayName: string;
    generalDescription: string;
    active: boolean;
    weight: number;
}

interface RHCriteriaBoxProps {
    trackName: string;
    criteria: Criterion[];
    availableCriteria: AvailableCriterion[];
    isExpanded: boolean;
    onToggle: () => void;
    onAddCriterion?: () => void;
    onAddPilar?: () => void;
    onDeleteTrack?: () => void;
    onDeleteCriterio?: (criterionIdx: number) => void;
    onDeleteCriterioFromGroup?: (groupIdx: number, criterionIdx: number) => void;
    onDeleteCriterionGroup?: (groupIdx: number) => void;
    onDeleteEvaluation?: (criterionIdx: number, evalIdx: number) => void;
    editingTrackIdx?: number | null;
    setEditingTrackIdx?: (idx: number | null) => void;
    editingTrackName?: string;
    setEditingTrackName?: (name: string) => void;
    handleTrackNameSave?: (idx: number) => void;
    handleTrackNameKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => void;
    trilhaIdx?: number;
    onEditCriterion?: (criterionIdx: number, newName: string) => void;
    onEditEvaluation?: (criterionIdx: number, evalIdx: number, field: 'name' | 'weight' | 'description' | 'mandatory', value: string | number | boolean) => void;
    onAddEvaluation?: (criterionIdx: number) => void;
    onEditCriterionGroup?: (criterionIdx: number, newName: string) => void;
    onAddCriterionToGroup?: (groupIdx: number, criterion: AvailableCriterion) => void;
    togglingCriteria?: Set<string>;
}

function RHCriteriaBox({ 
    trackName, 
    criteria: initialCriteria, 
    availableCriteria, 
    isExpanded, 
    onToggle, 
    onAddCriterion, 
    onAddPilar, 
    onDeleteTrack, 
    onDeleteCriterio, 
    onDeleteCriterioFromGroup, 
    onDeleteCriterionGroup, 
    onDeleteEvaluation, 
    editingTrackIdx, 
    setEditingTrackIdx, 
    editingTrackName, 
    setEditingTrackName, 
    handleTrackNameSave, 
    handleTrackNameKeyDown, 
    trilhaIdx, 
    onEditCriterion, 
    onEditEvaluation, 
    onAddEvaluation, 
    onEditCriterionGroup, 
    onAddCriterionToGroup,
    togglingCriteria = new Set()
}: RHCriteriaBoxProps) {
    const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);
    const [editingCriterionIdx, setEditingCriterionIdx] = useState<number | null>(null);
    const [editingCriterionName, setEditingCriterionName] = useState('');
    const [localEditingName, setLocalEditingName] = useState('');
    const [editingEvaluation, setEditingEvaluation] = useState<{criterionIdx: number|null, evalIdx: number|null, value: string}>({criterionIdx: null, evalIdx: null, value: ''});
    const [editingGroupIdx, setEditingGroupIdx] = useState<number | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');
    const [localEditingGroupName, setLocalEditingGroupName] = useState('');
    const [weightInputs, setWeightInputs] = useState<{ [key: string]: string }>({});
    const [descriptionInputs, setDescriptionInputs] = useState<{ [key: string]: string }>({});
    const [weightSuccess, setWeightSuccess] = useState<{ [key: string]: boolean }>({});
    const [descriptionSuccess, setDescriptionSuccess] = useState<{ [key: string]: boolean }>({});

    const handleToggleEvaluation = (criterionIndex: number, evalIndex: number) => {
        if (onEditEvaluation) {
            // Create the toggle key to check if this specific toggle is loading
            // criterionIndex = group index, evalIndex = criterion index within the group
            const toggleKey = `${trilhaIdx}-${criterionIndex}-${evalIndex}`;
            
            // Prevent multiple clicks if this toggle is already processing
            if (togglingCriteria.has(toggleKey)) {
                return;
            }
            
            const current = initialCriteria[criterionIndex].evaluations[evalIndex].mandatory;
            onEditEvaluation(criterionIndex, evalIndex, 'mandatory', !current);
        }
    };

    const toggleEvaluationDetails = (evaluationName: string) => {
        setExpandedEvaluation(expandedEvaluation === evaluationName ? null : evaluationName);
    };

    const handleCriterionDoubleClick = (criterionIdx: number, name: string) => {
        setEditingCriterionIdx(criterionIdx);
        setEditingCriterionName(name);
        setLocalEditingName(name);
    };

    const handleCriterionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalEditingName(e.target.value);
    };

    const handleCriterionNameSave = (criterionIdx: number) => {
        if (onEditCriterion && localEditingName.trim() && localEditingName !== editingCriterionName) {
            onEditCriterion(criterionIdx, localEditingName.trim());
        }
        setEditingCriterionIdx(null);
    };

    const handleCriterionNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, criterionIdx: number) => {
        if (e.key === 'Enter') handleCriterionNameSave(criterionIdx);
        if (e.key === 'Escape') setEditingCriterionIdx(null);
    };

    const handleGroupDoubleClick = (groupIdx: number, name: string) => {
        setEditingGroupIdx(groupIdx);
        setEditingGroupName(name);
        setLocalEditingGroupName(name);
    };

    const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalEditingGroupName(e.target.value);
    };

    const handleGroupNameSave = (groupIdx: number) => {
        if (onEditCriterionGroup && localEditingGroupName.trim() && localEditingGroupName !== editingGroupName) {
            onEditCriterionGroup(groupIdx, localEditingGroupName.trim());
        }
        setEditingGroupIdx(null);
    };

    const handleGroupNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, groupIdx: number) => {
        if (e.key === 'Enter') handleGroupNameSave(groupIdx);
        if (e.key === 'Escape') setEditingGroupIdx(null);
    };

    const handleEvaluationDoubleClick = (criterionIdx: number, evalIdx: number, value: string) => {
        setEditingEvaluation({ criterionIdx, evalIdx, value });
    };

    const handleEvaluationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingEvaluation(prev => ({ ...prev, value: e.target.value }));
    };

    const handleEvaluationNameSave = (criterionIdx: number, evalIdx: number) => {
        if (onEditEvaluation && editingEvaluation.value.trim() !== '' && editingEvaluation.value !== initialCriteria[criterionIdx].evaluations[evalIdx].name) {
            onEditEvaluation(criterionIdx, evalIdx, 'name', editingEvaluation.value.trim());
        }
        setEditingEvaluation({ criterionIdx: null, evalIdx: null, value: '' });
    };

    const handleEvaluationNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, criterionIdx: number, evalIdx: number) => {
        if (e.key === 'Enter') handleEvaluationNameSave(criterionIdx, evalIdx);
        if (e.key === 'Escape') setEditingEvaluation({ criterionIdx: null, evalIdx: null, value: '' });
    };

    const handleCriterionSelect = (groupIdx: number, criterion: any) => {
        if (onAddCriterionToGroup) {
            onAddCriterionToGroup(groupIdx, criterion as AvailableCriterion);
        }
    };

    const handleWeightInputChange = (criterionIdx: number, evalIdx: number, value: string) => {
        setWeightInputs(prev => ({ ...prev, [`${criterionIdx}-${evalIdx}`]: value }));
    };

    const handleWeightKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        criterionIdx: number,
        evalIdx: number,
        placeholderValue: number
    ) => {
        const key = `${criterionIdx}-${evalIdx}`;
        const value = Number(weightInputs[key]);
        if (e.key === 'Enter') {
            if (isNaN(value) || value < 5 || value > 95) {
                alert('O peso deve ser entre 5 e 95.');
                return;
            }
            if (onEditEvaluation) {
                // Wrap the update in a promise to show success after update
                Promise.resolve(onEditEvaluation(criterionIdx, evalIdx, 'weight', value)).then(() => {
                    setWeightSuccess(prev => ({ ...prev, [key]: true }));
                    setTimeout(() => {
                        setWeightSuccess(prev => ({ ...prev, [key]: false }));
                    }, 1500);
                });
                setTimeout(() => {
                    setWeightInputs(prev => ({ ...prev, [key]: '' }));
                }, 0);
            }
        }
    };

    const handleDescriptionInputChange = (criterionIdx: number, evalIdx: number, value: string) => {
        setDescriptionInputs(prev => ({ ...prev, [`${criterionIdx}-${evalIdx}`]: value }));
    };

    const handleDescriptionBlur = (criterionIdx: number, evalIdx: number, backendValue: string) => {
        const key = `${criterionIdx}-${evalIdx}`;
        const value = descriptionInputs[key];
        if (value !== undefined && value !== backendValue) {
            if (onEditEvaluation) {
                Promise.resolve(onEditEvaluation(criterionIdx, evalIdx, 'description', value)).then(() => {
                    setDescriptionSuccess(prev => ({ ...prev, [key]: true }));
                    setTimeout(() => {
                        setDescriptionSuccess(prev => ({ ...prev, [key]: false }));
                    }, 1500);
                });
            }
        }
        // Always clear the local input so the placeholder updates to the latest backend value
        setTimeout(() => {
            setDescriptionInputs(prev => ({ ...prev, [key]: '' }));
        }, 0);
    };

    const handleDescriptionKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
        criterionIdx: number,
        evalIdx: number,
        backendValue: string
    ) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleDescriptionBlur(criterionIdx, evalIdx, backendValue);
            (e.target as HTMLTextAreaElement).blur();
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg bg-white">
            <div className="p-3 sm:p-4 flex justify-between items-center cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {typeof editingTrackIdx === 'number' && editingTrackIdx === trilhaIdx ? (
                        <input
                            className="text-base sm:text-lg font-semibold text-[#08605F] border-b border-[#08605F] outline-none bg-transparent px-1"
                            value={editingTrackName}
                            onChange={e => setEditingTrackName && setEditingTrackName(e.target.value)}
                            onBlur={() => handleTrackNameSave && handleTrackNameSave(trilhaIdx ?? 0)}
                            onKeyDown={e => handleTrackNameKeyDown && handleTrackNameKeyDown(e, trilhaIdx ?? 0)}
                            autoFocus
                        />
                    ) : (
                        <span
                            className="text-base sm:text-lg font-semibold text-[#08605F] cursor-pointer select-none"
                            onDoubleClick={e => {
                                e.stopPropagation();
                                setEditingTrackIdx && setEditingTrackIdx(trilhaIdx ?? 0);
                            }}
                        >
                            {trackName}
                        </span>
                    )}
                    {isExpanded && onDeleteTrack && (
                        <button
                            className="ml-1 text-xs text-red-500 hover:text-red-700 p-1"
                            title="Remover trilha"
                            onClick={e => {
                                e.stopPropagation();
                                if (window.confirm('Tem certeza que deseja remover esta trilha?')) {
                                    onDeleteTrack();
                                }
                            }}
                        >
                            <FaTrash size={12} />
                        </button>
                    )}
                </div>
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {isExpanded && (
                <div className="p-3 sm:p-4 border-t border-gray-200">
                    <div className="flex mb-6 sm:mb-8">
                        {onAddPilar && (
                            <button
                                className="px-2 py-1 text-xs bg-gray-100 text-[#08605F] rounded hover:bg-gray-200 transition-colors"
                                onClick={e => {
                                    e.stopPropagation();
                                    onAddPilar();
                                }}
                            >
                                Adicionar Pilar
                            </button>
                        )}
                    </div>
                    {initialCriteria.map((criterion, criterionIndex) => (
                        <div key={criterionIndex} className="mb-8 sm:mb-10 relative">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                                <div className="flex items-center gap-2">
                                    {editingGroupIdx === criterionIndex ? (
                                        <input
                                            className="font-semibold text-gray-700 border-b border-[#08605F] outline-none bg-transparent px-1 text-sm sm:text-base"
                                            value={localEditingGroupName}
                                            onChange={handleGroupNameChange}
                                            onBlur={() => handleGroupNameSave(criterionIndex)}
                                            onKeyDown={e => handleGroupNameKeyDown(e, criterionIndex)}
                                            autoFocus
                                        />
                                    ) : (
                                        <h3
                                            className="font-semibold text-base sm:text-lg text-gray-700 cursor-pointer select-none"
                                            onDoubleClick={() => handleGroupDoubleClick(criterionIndex, criterion.name)}
                                        >
                                            {criterion.name}
                                        </h3>
                                    )}
                                    {onEditCriterionGroup && (
                                        <button
                                            className="ml-1 text-xs text-blue-600 hover:text-blue-800 p-1"
                                            title="Editar nome do pilar"
                                            onClick={() => handleGroupDoubleClick(criterionIndex, criterion.name)}
                                        >
                                            <FaEdit size={12} />
                                        </button>
                                    )}
                                </div>
                                {onDeleteCriterionGroup && isExpanded && (
                                    <button
                                        className="text-xs text-red-600 hover:text-red-700 p-1 border border-red-200 rounded-md bg-red-50 flex items-center justify-center self-start sm:self-auto"
                                            title="Remover pilar"
                                            onClick={() => {
                                                if (window.confirm('Tem certeza que deseja remover este pilar?')) {
                                                    onDeleteCriterionGroup(criterionIndex);
                                                }
                                            }}
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    )}
                            </div>
                            {onAddCriterionToGroup && (
                                <div className="mb-4">
                                    <EvaluationDropdown
                                        availableCriteria={availableCriteria as any}
                                        onSelect={(selectedCriterion) => handleCriterionSelect(criterionIndex, selectedCriterion)}
                                        placeholder="Adicionar critério"
                                    />
                                </div>
                            )}
                            {criterion.evaluations.map((evaluation, evalIndex) => {
                                
                                const toggleKey = `${trilhaIdx}-${criterionIndex}-${evalIndex}`;
                                const isToggling = togglingCriteria.has(toggleKey);
                                
                                return (
                                    <div key={evalIndex} className="border-b border-gray-200 last:border-b-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 sm:gap-0">
                                            <div className="flex items-center gap-3 sm:gap-4 order-2 sm:order-1">
                                                <div className={`${isToggling ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <ToggleSwitch
                                                        isToggled={evaluation.mandatory}
                                                        onToggle={() => handleToggleEvaluation(criterionIndex, evalIndex)}
                                                        loading={isToggling}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">Campo Obrigatório</span>
                                            </div>
                                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                                {/* Remove name editing, just display */}
                                                <p
                                                    className="text-sm cursor-default max-w-[200px] sm:max-w-none truncate sm:truncate-none"
                                                    title={evaluation.name}
                                                >
                                                    {evaluation.name}
                                                </p>
                                                <button onClick={() => toggleEvaluationDetails(evaluation.name)} className="p-2">
                                                    {expandedEvaluation === evaluation.name ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                                                </button>
                                                {onDeleteCriterioFromGroup && expandedEvaluation === evaluation.name && (
                                                    <button
                                                        className="text-xs text-red-600 hover:text-red-700 p-1 ml-2"
                                                        title="Remover critério do pilar"
                                                        onClick={() => {
                                                            if (window.confirm('Tem certeza que deseja remover este critério do pilar?')) {
                                                                onDeleteCriterioFromGroup(criterionIndex, evalIndex);
                                                            }
                                                        }}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {expandedEvaluation === evaluation.name && (
                                            <div className="p-3 sm:p-4 bg-gray-50 rounded-md my-2">
                                                <div className="gap-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600">Peso (%)</label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                placeholder={`Peso atual: ${evaluation.weight?.toString() ?? ""}`}
                                                                value={weightInputs[`${criterionIndex}-${evalIndex}`] || ''}
                                                                onChange={e => handleWeightInputChange(criterionIndex, evalIndex, e.target.value)}
                                                                onKeyDown={e => handleWeightKeyDown(e, criterionIndex, evalIndex, evaluation.weight)}
                                                                className="w-sm mt-1 p-2 border border-gray-300 rounded-md text-sm"
                                                            />
                                                            {weightSuccess[`${criterionIndex}-${evalIndex}`] && (
                                                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs animate-fade-in">Atualizado com sucesso!</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-600">Descrição do Critério</label>
                                                        {descriptionSuccess[`${criterionIndex}-${evalIndex}`] && (
                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs animate-fade-in">Atualizado com sucesso!</span>
                                                    )}
                                                        <textarea
                                                            placeholder={evaluation.description?.toString() ?? ""}
                                                            value={descriptionInputs[`${criterionIndex}-${evalIndex}`] ?? evaluation.description}
                                                            onChange={e => handleDescriptionInputChange(criterionIndex, evalIndex, e.target.value)}
                                                            onBlur={() => handleDescriptionBlur(criterionIndex, evalIndex, evaluation.description)}
                                                            onKeyDown={e => handleDescriptionKeyDown(e, criterionIndex, evalIndex, evaluation.description)}
                                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RHCriteriaBox;