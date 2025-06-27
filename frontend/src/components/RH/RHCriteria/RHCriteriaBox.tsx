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
}

function RHCriteriaBox({ trackName, criteria: initialCriteria, availableCriteria, isExpanded, onToggle, onAddCriterion, onAddPilar, onDeleteTrack, onDeleteCriterio, onDeleteCriterioFromGroup, onDeleteCriterionGroup, onDeleteEvaluation, editingTrackIdx, setEditingTrackIdx, editingTrackName, setEditingTrackName, handleTrackNameSave, handleTrackNameKeyDown, trilhaIdx, onEditCriterion, onEditEvaluation, onAddEvaluation, onEditCriterionGroup, onAddCriterionToGroup }: RHCriteriaBoxProps) {
    const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);
    const [editingCriterionIdx, setEditingCriterionIdx] = useState<number | null>(null);
    const [editingCriterionName, setEditingCriterionName] = useState('');
    const [localEditingName, setLocalEditingName] = useState('');
    const [editingEvaluation, setEditingEvaluation] = useState<{criterionIdx: number|null, evalIdx: number|null, value: string}>({criterionIdx: null, evalIdx: null, value: ''});
    const [editingGroupIdx, setEditingGroupIdx] = useState<number | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');
    const [localEditingGroupName, setLocalEditingGroupName] = useState('');

    const handleToggleEvaluation = (criterionIndex: number, evalIndex: number) => {
        if (onEditEvaluation) {
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

    const handleCriterionSelect = (groupIdx: number, criterion: AvailableCriterion) => {
        if (onAddCriterionToGroup) {
            onAddCriterionToGroup(groupIdx, criterion);
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg bg-white">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {typeof editingTrackIdx === 'number' && editingTrackIdx === trilhaIdx ? (
                        <input
                            className="text-lg font-semibold text-[#08605F] border-b border-[#08605F] outline-none bg-transparent px-1"
                            value={editingTrackName}
                            onChange={e => setEditingTrackName && setEditingTrackName(e.target.value)}
                            onBlur={() => handleTrackNameSave && handleTrackNameSave(trilhaIdx ?? 0)}
                            onKeyDown={e => handleTrackNameKeyDown && handleTrackNameKeyDown(e, trilhaIdx ?? 0)}
                            autoFocus
                        />
                    ) : (
                        <span
                            className="text-lg font-semibold text-[#08605F] cursor-pointer select-none"
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
                <div className="p-4 border-t border-gray-200">
                    <div className="flex justify-end mb-4">
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
                        <div key={criterionIndex} className="mb-6 relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {editingGroupIdx === criterionIndex ? (
                                        <input
                                            className="font-semibold text-gray-700 border-b border-[#08605F] outline-none bg-transparent px-1"
                                            value={localEditingGroupName}
                                            onChange={handleGroupNameChange}
                                            onBlur={() => handleGroupNameSave(criterionIndex)}
                                            onKeyDown={e => handleGroupNameKeyDown(e, criterionIndex)}
                                            autoFocus
                                        />
                                    ) : (
                                        <h3
                                            className="font-semibold text-gray-700 cursor-pointer select-none"
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
                                    {onAddCriterionToGroup && (
                                        <div className="ml-2 w-48">
                                            <EvaluationDropdown
                                                availableCriteria={availableCriteria.filter(c => 
                                                    !criterion.evaluations.some(evaluation => evaluation.name === c.displayName)
                                                )}
                                                onSelect={(selectedCriterion) => handleCriterionSelect(criterionIndex, selectedCriterion)}
                                                placeholder="Adicionar critério"
                                            />
                                        </div>
                                    )}
                                </div>
                                {onDeleteCriterionGroup && isExpanded && (
                                    <button
                                        className="text-xs text-red-600 hover:text-red-700 p-1 ml-2 border border-red-200 rounded-md bg-red-50 flex items-center justify-center"
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
                            {criterion.evaluations.map((evaluation, evalIndex) => (
                                <div key={evalIndex} className="border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-2">
                                            {editingEvaluation.criterionIdx === criterionIndex && editingEvaluation.evalIdx === evalIndex ? (
                                                <input
                                                    className="text-sm border-b border-[#08605F] outline-none bg-transparent px-1"
                                                    value={editingEvaluation.value}
                                                    onChange={handleEvaluationNameChange}
                                                    onBlur={() => handleEvaluationNameSave(criterionIndex, evalIndex)}
                                                    onKeyDown={e => handleEvaluationNameKeyDown(e, criterionIndex, evalIndex)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <p
                                                    className="text-sm cursor-pointer"
                                                    onDoubleClick={() => handleEvaluationDoubleClick(criterionIndex, evalIndex, evaluation.name)}
                                                >
                                                    {evaluation.name}
                                                </p>
                                            )}
                                            {onDeleteEvaluation && expandedEvaluation === evaluation.name && (
                                                <button
                                                    className="text-xs text-red-600 hover:text-red-700 p-1"
                                                    title="Remover avaliação"
                                                    onClick={() => {
                                                        if (window.confirm('Tem certeza que deseja remover esta avaliação?')) {
                                                            onDeleteEvaluation(criterionIndex, evalIndex);
                                                        }
                                                    }}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
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
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500">Campo Obrigatório</span>
                                            <ToggleSwitch
                                                isToggled={evaluation.mandatory}
                                                onToggle={() => handleToggleEvaluation(criterionIndex, evalIndex)}
                                            />
                                            <button onClick={() => toggleEvaluationDetails(evaluation.name)} className="p-2">
                                                {expandedEvaluation === evaluation.name ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedEvaluation === evaluation.name && (
                                        <div className="p-4 bg-gray-50 rounded-md my-2">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">Nome do Critério</label>
                                                    <input
                                                        type="text"
                                                        value={evaluation.name}
                                                        onChange={e => onEditEvaluation && onEditEvaluation(criterionIndex, evalIndex, 'name', e.target.value)}
                                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">Peso (%)</label>
                                                    <input
                                                        type="number"
                                                        value={evaluation.weight}
                                                        onChange={e => onEditEvaluation && onEditEvaluation(criterionIndex, evalIndex, 'weight', Number(e.target.value))}
                                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <label className="text-xs font-semibold text-gray-600">Descrição do Critério</label>
                                                <textarea
                                                    value={evaluation.description}
                                                    onChange={e => onEditEvaluation && onEditEvaluation(criterionIndex, evalIndex, 'description', e.target.value)}
                                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RHCriteriaBox;