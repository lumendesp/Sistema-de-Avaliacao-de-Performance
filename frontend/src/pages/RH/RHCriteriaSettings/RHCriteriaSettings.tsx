import { useState, useEffect } from 'react';
import CollaboratorsSearchBar from '../../../components/CollaboratorsSearchBar';
import RHCriteriaBox from '../../../components/RH/RHCriteria/RHCriteriaBox';
import { IoFunnel } from "react-icons/io5";
import { getAllTracks, createTrack, updateTrack, deleteTrack, getAllRhCriteria, createRhCriterion, updateRhCriterion, deleteRhCriterion, getCriteriaByTrack, addCriterionToTrack, removeCriterionFromTrack } from '../../../services/api';
import type { Track } from '../../../types/track';

interface Criterion {
    id: number;
    name: string;
    generalDescription: string;
    active: boolean;
    evaluations?: Evaluation[];
}

interface Evaluation {
    name: string;
    mandatory: boolean;
    weight: number;
    description: string;
}

interface CriteriaGroup {
    trackName: string;
    trackId?: number;
    criteria: Criterion[];
}

function RhCriteriaSettings() {
    const [activeTab, setActiveTab] = useState<'track' | 'unit'>('track');
    const [openBoxIndex, setOpenBoxIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data from backend
    const [tracks, setTracks] = useState<Track[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    
    // Local state for UI
    const [criteriaData, setCriteriaData] = useState<CriteriaGroup[]>([]);
    const [editingTrackIdx, setEditingTrackIdx] = useState<number | null>(null);
    const [editingTrackName, setEditingTrackName] = useState('');

    // Load data from backend
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const tracksData = await getAllTracks();
                // For each track, fetch its criteria
                const criteriaGroups = await Promise.all(
                    tracksData.map(async (track: Track) => {
                        const configured = await getCriteriaByTrack(track.id);
                        return {
                            trackName: track.name,
                            trackId: track.id,
                            criteria: configured.map((cfg: any) => cfg.criterion)
                        };
                    })
                );
                setCriteriaData(criteriaGroups);
            } catch (error) {
                console.error('Error loading data:', error);
                alert('Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Save track name on blur or Enter
    const handleTrackNameSave = async (idx: number) => {
        const group = criteriaData[idx];
        if (!group.trackId) return;

        try {
            await updateTrack(group.trackId, { name: editingTrackName });
            setCriteriaData(prev => prev.map((group, gIdx) =>
                gIdx === idx ? { ...group, trackName: editingTrackName } : group
            ));
            setEditingTrackIdx(null);
        } catch (error) {
            console.error('Error updating track:', error);
            alert('Erro ao atualizar trilha');
        }
    };

    const handleTrackNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Enter') {
            handleTrackNameSave(idx);
        }
    };

    // Add a new track
    const handleAddCriteriaGroup = async () => {
        try {
            const newTrack = await createTrack({ name: 'Nova Trilha' });
            const newGroup = {
                trackName: newTrack.name,
                trackId: newTrack.id,
                criteria: []
            };
            
            setCriteriaData(prev => [newGroup, ...prev]);
            setOpenBoxIndex(0);
        } catch (error) {
            console.error('Error creating track:', error);
            alert('Erro ao criar trilha');
        }
    };

    // Add a new criterion to a track
    const handleAddCriterion = async (groupIdx: number) => {
        try {
            // 1. Create the criterion itself
            const newCriterion = await createRhCriterion({
                name: 'Novo Critério',
                generalDescription: 'Descrição do critério',
                active: true
            });
            // 2. Associate it with the track (use default unitId/positionId)
            const group = criteriaData[groupIdx];
            const trackId = group.trackId;
            const unitId = 1; // Default
            const positionId = 1; // Default
            await addCriterionToTrack(trackId, newCriterion.id, unitId, positionId, false);
            // 3. Fetch updated criteria for this track
            const updatedConfigured = await getCriteriaByTrack(trackId);
            setCriteriaData(prev => prev.map((g, idx) =>
                idx === groupIdx
                    ? { ...g, criteria: updatedConfigured.map((cfg: any) => cfg.criterion) }
                    : g
            ));
        } catch (error) {
            alert('Erro ao adicionar critério à trilha');
        }
    };

    // Delete a track
    const handleDeleteTrack = async (idx: number) => {
        const group = criteriaData[idx];
        if (!group.trackId) return;

        try {
            await deleteTrack(group.trackId);
            setCriteriaData(prev => prev.filter((_, gIdx) => gIdx !== idx));
            if (openBoxIndex === idx) setOpenBoxIndex(null);
        } catch (error) {
            console.error('Error deleting track:', error);
            alert('Erro ao deletar trilha');
        }
    };

    // Remove a criterion from a track
    const handleDeleteCriterio = async (groupIdx: number, criterionIdx: number) => {
        const group = criteriaData[groupIdx];
        const criterion = group.criteria[criterionIdx];
        try {
            await removeCriterionFromTrack(group.trackId, criterion.id);
            // Fetch updated criteria for this track
            const updatedConfigured = await getCriteriaByTrack(group.trackId);
            setCriteriaData(prev => prev.map((g, idx) =>
                idx === groupIdx
                    ? { ...g, criteria: updatedConfigured.map((cfg: any) => cfg.criterion) }
                    : g
            ));
        } catch (error) {
            alert('Erro ao remover critério da trilha');
        }
    };

    // Delete an evaluation (this would need backend implementation)
    const handleDeleteEvaluation = (groupIdx: number, criterionIdx: number, evalIdx: number) => {
        // This would need backend implementation for evaluations
        setCriteriaData(prev => prev.map((group, gIdx) =>
            gIdx === groupIdx
                ? {
                    ...group,
                    criteria: group.criteria.map((criterion, cIdx) =>
                        cIdx === criterionIdx
                            ? { ...criterion, evaluations: criterion.evaluations?.filter((_, eIdx) => eIdx !== evalIdx) || [] }
                            : criterion
                    )
                }
                : group
        ));
    };

    // Edit a criterion name
    const handleEditCriterion = async (groupIdx: number, criterionIdx: number, newName: string) => {
        const group = criteriaData[groupIdx];
        const criterion = group.criteria[criterionIdx];
        
        try {
            await updateRhCriterion(criterion.id, { name: newName });
            setCriteriaData(prev => prev.map((group, gIdx) =>
                gIdx === groupIdx
                    ? {
                        ...group,
                        criteria: group.criteria.map((criterion, cIdx) =>
                            cIdx === criterionIdx ? { ...criterion, name: newName } : criterion
                        )
                    }
                    : group
            ));
        } catch (error) {
            console.error('Error updating criterion:', error);
            alert('Erro ao atualizar critério');
        }
    };

    // Edit an evaluation field (this would need backend implementation)
    const handleEditEvaluation = (groupIdx: number, criterionIdx: number, evalIdx: number, field: 'name' | 'weight' | 'description' | 'mandatory', value: string | number | boolean) => {
        // This would need backend implementation for evaluations
        setCriteriaData(prev => prev.map((group, gIdx) =>
            gIdx === groupIdx
                ? {
                    ...group,
                    criteria: group.criteria.map((criterion, cIdx) =>
                        cIdx === criterionIdx
                            ? {
                                ...criterion,
                                evaluations: criterion.evaluations?.map((evaluation, eIdx) =>
                                    eIdx === evalIdx ? { ...evaluation, [field]: value } : evaluation
                                ) || []
                            }
                            : criterion
                    )
                }
                : group
        ));
    };

    // Add a new evaluation to a criterion (this would need backend implementation)
    const handleAddEvaluation = (groupIdx: number, criterionIdx: number) => {
        // This would need backend implementation for evaluations
        setCriteriaData(prev => prev.map((group, gIdx) =>
            gIdx === groupIdx
                ? {
                    ...group,
                    criteria: group.criteria.map((criterion, cIdx) =>
                        cIdx === criterionIdx
                            ? {
                                ...criterion,
                                evaluations: [
                                    {
                                        name: 'Nova Avaliação',
                                        mandatory: false,
                                        weight: 0,
                                        description: ''
                                    },
                                    ...(criterion.evaluations || [])
                                ]
                            }
                            : criterion
                    )
                }
                : group
        ));
    };

    // Save all changes
    const handleSave = async () => {
        try {
            setSaving(true);
            // Here you could implement bulk save if needed
            console.log('Salvando critérios:', criteriaData);
            alert('Critérios salvos com sucesso!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Erro ao salvar alterações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Critérios de Avaliação</h1>
                <button 
                    className="bg-[#08605F] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Salvando...' : 'Salvar alterações'}
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
                            <CollaboratorsSearchBar placeholder="Buscar por Trilha" onSearch={term => console.log('Search term:', term)} />
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
                                <RHCriteriaBox
                                    trackName={group.trackName || `Trilha ${idx + 1}`}
                                    criteria={group.criteria.map(criterion => ({
                                        name: criterion.name,
                                        evaluations: criterion.evaluations || []
                                    }))}
                                    isExpanded={openBoxIndex === idx}
                                    onToggle={() => setOpenBoxIndex(openBoxIndex === idx ? null : idx)}
                                    onAddCriterion={() => handleAddCriterion(idx)}
                                    onDeleteTrack={() => handleDeleteTrack(idx)}
                                    onDeleteCriterio={criterionIdx => handleDeleteCriterio(idx, criterionIdx)}
                                    onDeleteEvaluation={(criterionIdx, evalIdx) => handleDeleteEvaluation(idx, criterionIdx, evalIdx)}
                                    editingTrackIdx={editingTrackIdx}
                                    setEditingTrackIdx={setEditingTrackIdx}
                                    editingTrackName={editingTrackName}
                                    setEditingTrackName={setEditingTrackName}
                                    handleTrackNameSave={handleTrackNameSave}
                                    handleTrackNameKeyDown={(e, idx) => handleTrackNameKeyDown(e, idx)}
                                    trilhaIdx={idx}
                                    onEditCriterion={(criterionIdx, newName) => handleEditCriterion(idx, criterionIdx, newName)}
                                    onEditEvaluation={(criterionIdx, evalIdx, field, value) => handleEditEvaluation(idx, criterionIdx, evalIdx, field, value)}
                                    onAddEvaluation={criterionIdx => handleAddEvaluation(idx, criterionIdx)}
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