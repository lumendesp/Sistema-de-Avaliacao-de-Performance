import { useState } from 'react';
import CollaboratorsSearchBar from '../../../components/CollaboratorsSearchBar';
import RHCriteriaBox from '../../../components/RH/RHCriteria/RHCriteriaBox';
import { IoFunnel } from "react-icons/io5";
import { FaTrash } from 'react-icons/fa';

function RhCriteriaSettings() {
    const [activeTab, setActiveTab] = useState<'track' | 'unit'>('track');
    const [openBoxIndex, setOpenBoxIndex] = useState<number | null>(null);

    // Editable criteria data
    const [criteriaData, setCriteriaData] = useState([
        {
            trackName: 'Product Design',
            criteria: [
                {
                    name: 'Critérios de Postura',
                    evaluations: [
                        { name: 'Sentimento de Dono', mandatory: true, weight: 10, description: 'Descrição detalhada do critério Sentimento de Dono...' },
                        { name: 'Comunicação', mandatory: false, weight: 5, description: 'Descrição detalhada do critério Comunicação...' }
                    ]
                },
                {
                    name: 'Critérios Técnicos',
                    evaluations: [
                        { name: 'Qualidade do Design', mandatory: true, weight: 15, description: 'Descrição detalhada do critério Qualidade do Design...' },
                    ]
                }
            ]
        },
        {
            trackName: 'Product Design',
            criteria: [
                {
                    name: 'Critérios de Postura',
                    evaluations: [
                        { name: 'Sentimento de Dono', mandatory: true, weight: 10, description: 'Descrição detalhada do critério Sentimento de Dono...' },
                        { name: 'Comunicação', mandatory: false, weight: 5, description: 'Descrição detalhada do critério Comunicação...' }
                    ]
                },
                {
                    name: 'Critérios Técnicos',
                    evaluations: [
                        { name: 'Qualidade do Design', mandatory: true, weight: 15, description: 'Descrição detalhada do critério Qualidade do Design...' },
                    ]
                }
            ]
        },
        {
            trackName: 'Product Design',
            criteria: [
                {
                    name: 'Critérios de Postura',
                    evaluations: [
                        { name: 'Sentimento de Dono', mandatory: true, weight: 10, description: 'Descrição detalhada do critério Sentimento de Dono...' },
                        { name: 'Comunicação', mandatory: false, weight: 5, description: 'Descrição detalhada do critério Comunicação...' }
                    ]
                },
                {
                    name: 'Critérios Técnicos',
                    evaluations: [
                        { name: 'Qualidade do Design', mandatory: true, weight: 15, description: 'Descrição detalhada do critério Qualidade do Design...' },
                    ]
                }
            ]
        },
        {
            trackName: 'Product Design',
            criteria: [
                {
                    name: 'Critérios de Postura',
                    evaluations: [
                        { name: 'Sentimento de Dono', mandatory: true, weight: 10, description: 'Descrição detalhada do critério Sentimento de Dono...' },
                        { name: 'Comunicação', mandatory: false, weight: 5, description: 'Descrição detalhada do critério Comunicação...' }
                    ]
                },
                {
                    name: 'Critérios Técnicos',
                    evaluations: [
                        { name: 'Qualidade do Design', mandatory: true, weight: 15, description: 'Descrição detalhada do critério Qualidade do Design...' },
                    ]
                }
            ]
        }
    ]);

    // State for editing track (trilha) names
    const [editingTrackIdx, setEditingTrackIdx] = useState<number | null>(null);
    const [editingTrackName, setEditingTrackName] = useState('');

    // Handle double click to edit track name
    const handleTrackNameDoubleClick = (idx: number) => {
        setEditingTrackIdx(idx);
        setEditingTrackName(criteriaData[idx].trackName);
    };

    // Handle track name change
    const handleTrackNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingTrackName(e.target.value);
    };

    // Save track name on blur or Enter
    const handleTrackNameSave = (idx: number) => {
        setCriteriaData(prev => prev.map((group, gIdx) =>
            gIdx === idx ? { ...group, trackName: editingTrackName } : group
        ));
        setEditingTrackIdx(null);
    };

    const handleTrackNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Enter') {
            handleTrackNameSave(idx);
        }
    };

    // Add a new criteria group (box)
    const handleAddCriteriaGroup = () => {
        setCriteriaData([
            {
                trackName: 'Nova Trilha',
                criteria: [
                    {
                        name: 'Novo Critério',
                        evaluations: [
                            { name: 'Nova Avaliação', mandatory: false, weight: 0, description: '' }
                        ]
                    }
                ]
            },
            ...criteriaData
        ]);
        setOpenBoxIndex(0);
    };

    // Add a new evaluation to a criteria group (now adds a new criterion at the top)
    const handleAddEvaluation = (groupIdx: number, _criterionIdx: number) => {
        setCriteriaData(prev => prev.map((group, gIdx) =>
            gIdx === groupIdx
                ? {
                    ...group,
                    criteria: [
                        {
                            name: 'Novo Critério',
                            evaluations: [
                                { name: 'Nova Avaliação', mandatory: false, weight: 0, description: '' }
                            ]
                        },
                        ...group.criteria
                    ]
                }
                : group
        ));
    };

    // Handler to delete a trilha (track)
    const handleDeleteTrilha = (idx: number) => {
        setCriteriaData(prev => prev.filter((_, gIdx) => gIdx !== idx));
        if (openBoxIndex === idx) setOpenBoxIndex(null);
    };

    // Handler to delete a criterio (criterion)
    const handleDeleteCriterio = (groupIdx: number, criterionIdx: number) => {
        setCriteriaData(prev => prev.map((group, gIdx) =>
            gIdx === groupIdx
                ? { ...group, criteria: group.criteria.filter((_, cIdx) => cIdx !== criterionIdx) }
                : group
        ));
    };

    // Handler to delete an evaluation from a criterion
    const handleDeleteEvaluation = (groupIdx: number, criterionIdx: number, evalIdx: number) => {
        setCriteriaData(prev => prev.map((group, gIdx) =>
            gIdx === groupIdx
                ? {
                    ...group,
                    criteria: group.criteria.map((criterion, cIdx) =>
                        cIdx === criterionIdx
                            ? { ...criterion, evaluations: criterion.evaluations.filter((_, eIdx) => eIdx !== evalIdx) }
                            : criterion
                    )
                }
                : group
        ));
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Critérios de Avaliação</h1>
                <button className="bg-[#08605F] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">
                    Salvar alterações
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-300 mb-6">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'track' ? 'border-b-2 border-[#08605F] text-[#08605F]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('track')}
                >
                    Trilha
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'unit' ? 'border-b-2 border-[#08605F] text-[#08605F]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('unit')}
                >
                    Unidade
                </button>
            </div>

            {/* Content */}
            {activeTab === 'track' && (
                <div>
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                        <div className="flex-grow w-full md:w-auto">
                            <CollaboratorsSearchBar/>
                        </div>
                        <div className="bg-[#08605F] p-3 rounded-md text-white">
                            <IoFunnel size={24} />
                        </div>
                    </div>
                    {/* Criteria Section */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-lg text-gray-700">Trilha</span>
                        <button
                            className="px-2 py-1 text-xs bg-gray-100 text-[#08605F] rounded hover:bg-gray-200 transition-colors"
                            onClick={handleAddCriteriaGroup}
                        >
                            Adicionar Trilha
                        </button>
                    </div>
                    <div className="flex flex-col gap-6">
                        {criteriaData.map((group, idx) => (
                            <div key={idx}>
                                <div className="mb-2 flex items-center gap-2">
                                    {editingTrackIdx === idx ? (
                                        <input
                                            className="text-lg font-semibold text-[#08605F] border-b border-[#08605F] outline-none bg-transparent px-1"
                                            value={editingTrackName}
                                            onChange={handleTrackNameChange}
                                            onBlur={() => handleTrackNameSave(idx)}
                                            onKeyDown={e => handleTrackNameKeyDown(e, idx)}
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <span
                                                className="text-lg font-semibold text-[#08605F] cursor-pointer select-none"
                                                onDoubleClick={() => handleTrackNameDoubleClick(idx)}
                                            >
                                                {group.trackName || `Trilha ${idx + 1}`}
                                            </span>
                                            {openBoxIndex === idx && (
                                                <button
                                                    className="ml-1 text-xs text-red-500 hover:text-red-700 p-1"
                                                    title="Remover trilha"
                                                    onClick={() => {
                                                        if (window.confirm('Tem certeza que deseja remover esta trilha?')) {
                                                            handleDeleteTrilha(idx);
                                                        }
                                                    }}
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <RHCriteriaBox
                                    trackName={group.trackName || `Trilha ${idx + 1}`}
                                    criteria={group.criteria}
                                    isExpanded={openBoxIndex === idx}
                                    onToggle={() => setOpenBoxIndex(openBoxIndex === idx ? null : idx)}
                                    onAddEvaluation={criterionIdx => handleAddEvaluation(idx, criterionIdx)}
                                    onDeleteCriterio={criterionIdx => handleDeleteCriterio(idx, criterionIdx)}
                                    onDeleteEvaluation={(criterionIdx, evalIdx) => handleDeleteEvaluation(idx, criterionIdx, evalIdx)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'unit' && (
                <div className="text-center p-8">
                    <h2 className="text-xl text-gray-500">A seção Unidade está em desenvolvimento.</h2>
                </div>
            )}
        </div>
    );
}

export default RhCriteriaSettings;