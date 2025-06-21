import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
}

function RHCriteriaBox({ trackName, criteria: initialCriteria }: RHCriteriaBoxProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedEvaluation, setExpandedEvaluation] = useState<string | null>(null);
    const [criteria, setCriteria] = useState(initialCriteria);

    const handleToggleEvaluation = (criterionIndex: number, evalIndex: number) => {
        const newCriteria = [...criteria];
        newCriteria[criterionIndex].evaluations[evalIndex].mandatory = !newCriteria[criterionIndex].evaluations[evalIndex].mandatory;
        setCriteria(newCriteria);
    };

    const toggleEvaluationDetails = (evaluationName: string) => {
        setExpandedEvaluation(expandedEvaluation === evaluationName ? null : evaluationName);
    };

    return (
        <div className="border border-gray-300 rounded-lg bg-white">
            <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h2 className="text-lg font-semibold">{trackName}</h2>
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-gray-200">
                    {criteria.map((criterion, criterionIndex) => (
                        <div key={criterionIndex} className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">{criterion.name}</h3>
                            {criterion.evaluations.map((evaluation, evalIndex) => (
                                <div key={evalIndex} className="border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center justify-between py-3">
                                        <p className="text-sm">{evaluation.name}</p>
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
                                                        defaultValue={evaluation.name}
                                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-600">Peso (%)</label>
                                                    <input
                                                        type="number"
                                                        defaultValue={evaluation.weight}
                                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <label className="text-xs font-semibold text-gray-600">Descrição do Critério</label>
                                                <textarea
                                                    defaultValue={evaluation.description}
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
