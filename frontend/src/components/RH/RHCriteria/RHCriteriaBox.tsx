import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';

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

interface RHCriteriaBoxProps {
    trackName: string;
    criteria: Criterion[];
    isExpanded: boolean;
    onToggle: () => void;
    onAddCriterion?: () => void;
    onDeleteTrack?: () => void;
    onDeleteCriterio?: (criterionIdx: number) => void;
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
}

function RHCriteriaBox({ trackName, criteria: initialCriteria, isExpanded, onToggle, onAddCriterion, onDeleteTrack, onDeleteCriterio, onDeleteEvaluation, editingTrackIdx, setEditingTrackIdx, editingTrackName, setEditingTrackName, handleTrackNameSave, handleTrackNameKeyDown, trilhaIdx, onEditCriterion, onEditEvaluation, onAddEvaluation }: RHCriteriaBoxProps) {
    const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);
    const [editingCriterionIdx, setEditingCriterionIdx] = useState<number | null>(null);
    const [editingCriterionName, setEditingCriterionName] = useState('');

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
    };

    const handleCriterionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingCriterionName(e.target.value);
    };

    const handleCriterionNameSave = (criterionIdx: number) => {
        if (onEditCriterion) onEditCriterion(criterionIdx, editingCriterionName);
        setEditingCriterionIdx(null);
    };

    const handleCriterionNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, criterionIdx: number) => {
        if (e.key === 'Enter') handleCriterionNameSave(criterionIdx);
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
                                console.log('Delete track button clicked');
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
                        {onAddCriterion && (
                            <button
                                className="px-2 py-1 text-xs bg-gray-100 text-[#08605F] rounded hover:bg-gray-200 transition-colors"
                                onClick={e => {
                                    e.stopPropagation();
                                    console.log('Add criterion button clicked');
                                    onAddCriterion();
                                }}
                            >
                                Adicionar Critério
                            </button>
                        )}
                    </div>
                    {initialCriteria.map((criterion, criterionIndex) => (
                        <div key={criterionIndex} className="mb-6 relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {editingCriterionIdx === criterionIndex ? (
                                        <input
                                            className="font-semibold text-gray-700 border-b border-[#08605F] outline-none bg-transparent px-1"
                                            value={editingCriterionName}
                                            onChange={handleCriterionNameChange}
                                            onBlur={() => handleCriterionNameSave(criterionIndex)}
                                            onKeyDown={e => handleCriterionNameKeyDown(e, criterionIndex)}
                                            autoFocus
                                        />
                                    ) : (
                                        <h3
                                            className="font-semibold text-gray-700 cursor-pointer select-none"
                                            onDoubleClick={() => {
                                                setEditingCriterionIdx(criterionIndex);
                                                setEditingCriterionName(criterion.name);
                                            }}
                                        >
                                            {criterion.name}
                                        </h3>
                                    )}
                                    {onAddEvaluation && (
                                        <button
                                            className="ml-1 text-xs text-green-600 hover:text-green-800 p-1 border border-green-200 rounded-md bg-green-50 font-bold w-6 h-6 flex items-center justify-center"
                                            title="Adicionar avaliação"
                                            onClick={() => {
                                                console.log('Add evaluation button clicked', criterionIndex);
                                                onAddEvaluation(criterionIndex);
                                            }}
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                                {onDeleteCriterio && isExpanded && (
                                    <button
                                        className="text-xs text-red-600 hover:text-red-700 p-1 ml-2 border border-red-200 rounded-md bg-red-50 flex items-center justify-center"
                                        title="Remover critério"
                                        onClick={() => {
                                            console.log('Delete criterion button clicked', criterionIndex);
                                            if (window.confirm('Tem certeza que deseja remover este critério?')) {
                                                onDeleteCriterio(criterionIndex);
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
                                            {expandedEvaluation === evaluation.name ? (
                                                <input
                                                    className="text-sm border-b border-[#08605F] outline-none bg-transparent px-1"
                                                    value={evaluation.name}
                                                    onChange={e => onEditEvaluation && onEditEvaluation(criterionIndex, evalIndex, 'name', e.target.value)}
                                                />
                                            ) : (
                                                <p className="text-sm">{evaluation.name}</p>
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