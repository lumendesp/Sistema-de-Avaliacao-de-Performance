import { useState, useEffect } from 'react';
import CollaboratorsSearchBar from '../../../components/CollaboratorsSearchBar';
import RHCriteriaBox from '../../../components/RH/RHCriteria/RHCriteriaBox';
import { IoFunnel } from "react-icons/io5";
import { 
    getAllTracks, 
    createTrack, 
    updateTrack, 
    deleteTrack, 
    getAllRhCriteria, 
    createRhCriterion, 
    updateRhCriterion, 
    deleteRhCriterion, 
    getCriteriaByTrack, 
    addCriterionToTrack, 
    removeCriterionFromTrack, 
    getTracksWithCriteria,
    updateCriterionInTrack,
    getUnits,
    getPositions,
    createDefaultGroup,
    createCriterionGroup,
    addCriterionToGroup,
    updateCriterionGroup,
    deleteCriterionGroup
} from '../../../services/api';
import type { Track } from '../../../types/track';

interface Criterion {
    id: number;
    name: string;
    displayName: string;
    generalDescription: string;
    active: boolean;
    weight: number;
}

interface Evaluation {
    name: string;
    mandatory: boolean;
    weight: number;
    description: string;
}

interface CriterionGroup {
    id: number;
    name: string;
    trackId: number;
    unitId: number;
    positionId: number;
    configuredCriteria: ConfiguredCriterion[];
}

interface ConfiguredCriterion {
    id: number;
    criterionId: number;
    groupId: number;
    trackId: number;
    unitId: number;
    positionId: number;
    mandatory: boolean;
    criterion: Criterion;
}

interface TrackWithCriteria {
    id: number;
    name: string;
    CriterionGroup: CriterionGroup[];
}

interface Unit {
    id: number;
    name: string;
}

interface Position {
    id: number;
    name: string;
}

function RhCriteriaSettings() {
    const [activeTab, setActiveTab] = useState<'track' | 'unit'>('track');
    const [openBoxIndex, setOpenBoxIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data from backend
    const [tracksWithCriteria, setTracksWithCriteria] = useState<TrackWithCriteria[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    
    // Local state for UI
    const [editingTrackIdx, setEditingTrackIdx] = useState<number | null>(null);
    const [editingTrackName, setEditingTrackName] = useState('');

    // Load data from backend
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [tracksData, criteriaData, unitsData, positionsData] = await Promise.all([
                    getTracksWithCriteria(),
                    getAllRhCriteria(),
                    getUnits(),
                    getPositions()
                ]);
                setTracksWithCriteria(tracksData);
                setCriteria(criteriaData);
                setUnits(unitsData);
                setPositions(positionsData);
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
        const track = tracksWithCriteria[idx];
        if (!track) return;

        try {
            await updateTrack(track.id, { name: editingTrackName });
            setTracksWithCriteria(prev => prev.map((t, tIdx) =>
                tIdx === idx ? { ...t, name: editingTrackName } : t
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
            
            // Create a default group for the new track
            const defaultUnit = units[0];
            const defaultPosition = positions[0];
            
            if (defaultUnit && defaultPosition) {
                await createDefaultGroup(newTrack.id, defaultUnit.id, defaultPosition.id);
            }
            
            const newTrackWithCriteria = {
                id: newTrack.id,
                name: newTrack.name,
                CriterionGroup: []
            };
            
            setTracksWithCriteria(prev => [newTrackWithCriteria, ...prev]);
            setOpenBoxIndex(0);
            
            // Refresh data to get the complete structure
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error creating track:', error);
            alert('Erro ao criar trilha');
        }
    };

    // Add a new criterion to a track
    const handleAddCriterion = async (trackIdx: number, groupIdx: number) => {
        try {
            const track = tracksWithCriteria[trackIdx];
            const group = track.CriterionGroup[groupIdx];
            
            if (!track || !group) return;

            // For now, we'll use the first available criterion
            const availableCriterion = criteria.find(c => 
                !group.configuredCriteria.some(cc => cc.criterionId === c.id)
            );

            if (!availableCriterion) {
                alert('Todos os critérios já estão associados a este grupo');
                return;
            }

            // Add criterion to the group
            await addCriterionToTrack(
                track.id, 
                availableCriterion.id, 
                group.id, 
                group.unitId, 
                group.positionId, 
                false
            );

            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error adding criterion:', error);
            alert('Erro ao adicionar critério à trilha');
        }
    };

    // Add a new pillar (criterion group) to a track
    const handleAddPilar = async (trackIdx: number) => {
        try {
            const track = tracksWithCriteria[trackIdx];
            if (!track) return;

            // Use the first available unit and position
            const defaultUnit = units[0];
            const defaultPosition = positions[0];
            
            if (!defaultUnit || !defaultPosition) {
                alert('É necessário ter pelo menos uma unidade e uma posição cadastradas');
                return;
            }

            // Create a new criterion group
            const newGroup = await createCriterionGroup({
                name: 'Novo Pilar',
                trackId: track.id,
                unitId: defaultUnit.id,
                positionId: defaultPosition.id,
            });

            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error creating pillar:', error);
            alert('Erro ao criar pilar');
        }
    };

    // Add a new criterion to a specific group
    const handleAddCriterionToGroup = async (trackIdx: number, groupIdx: number) => {
        try {
            const track = tracksWithCriteria[trackIdx];
            const group = track.CriterionGroup[groupIdx];
            
            if (!track || !group) return;

            // Find available criteria that are not already in this group
            const availableCriterion = criteria.find(c => 
                !group.configuredCriteria.some(cc => cc.criterionId === c.id)
            );

            if (!availableCriterion) {
                alert('Todos os critérios já estão associados a este pilar');
                return;
            }

            // Add criterion to the specific group
            await addCriterionToGroup(
                group.id,
                availableCriterion.id,
                track.id,
                group.unitId,
                group.positionId,
                false
            );

            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error adding criterion to group:', error);
            alert('Erro ao adicionar critério ao pilar');
        }
    };

    // Edit a criterion group name
    const handleEditCriterionGroup = async (trackIdx: number, groupIdx: number, newName: string) => {
        const track = tracksWithCriteria[trackIdx];
        const group = track?.CriterionGroup[groupIdx];
        
        if (!track || !group) return;
        
        try {
            await updateCriterionGroup(group.id, { name: newName });
            
            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error updating criterion group:', error);
            alert('Erro ao atualizar pilar');
        }
    };

    // Add a criterion to a specific group using the dropdown
    const handleAddCriterionToGroupFromDropdown = async (trackIdx: number, groupIdx: number, selectedCriterion: Criterion) => {
        try {
            const track = tracksWithCriteria[trackIdx];
            const group = track.CriterionGroup[groupIdx];
            
            if (!track || !group) return;

            // Add criterion to the specific group
            await addCriterionToGroup(
                group.id,
                selectedCriterion.id,
                track.id,
                group.unitId,
                group.positionId,
                false
            );

            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error adding criterion to group:', error);
            alert('Erro ao adicionar critério ao pilar');
        }
    };

    // Delete a track
    const handleDeleteTrack = async (idx: number) => {
        const track = tracksWithCriteria[idx];
        if (!track) return;

        try {
            await deleteTrack(track.id);
            
            // Refresh data from backend to ensure consistency
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
            
            // Close the expanded box if it was the deleted track
            if (openBoxIndex === idx) setOpenBoxIndex(null);
        } catch (error) {
            console.error('Error deleting track:', error);
            alert('Erro ao deletar trilha');
        }
    };

    // Remove a criterion from a track
    const handleDeleteCriterio = async (trackIdx: number, groupIdx: number, criterionIdx: number) => {
        const track = tracksWithCriteria[trackIdx];
        const group = track?.CriterionGroup[groupIdx];
        const configuredCriterion = group?.configuredCriteria[criterionIdx];
        
        if (!track || !group || !configuredCriterion) return;

        try {
            await removeCriterionFromTrack(track.id, configuredCriterion.criterionId);
            
            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error removing criterion:', error);
            alert('Erro ao remover critério da trilha');
        }
    };

    // Delete a criterion group (pillar)
    const handleDeleteCriterionGroup = async (trackIdx: number, groupIdx: number) => {
        const track = tracksWithCriteria[trackIdx];
        const group = track?.CriterionGroup[groupIdx];
        
        if (!track || !group) return;

        try {
            await deleteCriterionGroup(group.id);
            
            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error deleting criterion group:', error);
            alert('Erro ao deletar pilar');
        }
    };

    // Delete an evaluation (this would need backend implementation)
    const handleDeleteEvaluation = (trackIdx: number, groupIdx: number, criterionIdx: number, evalIdx: number) => {
        // This would need backend implementation for evaluations
        console.log('Delete evaluation not implemented yet');
    };

    // Edit a criterion name
    const handleEditCriterion = async (trackIdx: number, groupIdx: number, criterionIdx: number, newName: string) => {
        const track = tracksWithCriteria[trackIdx];
        const group = track?.CriterionGroup[groupIdx];
        const configuredCriterion = group?.configuredCriteria[criterionIdx];
        
        if (!track || !group || !configuredCriterion) return;
        
        try {
            await updateRhCriterion(configuredCriterion.criterionId, { name: newName });
            
            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error updating criterion:', error);
            alert('Erro ao atualizar critério');
        }
    };

    // Edit an evaluation field (mandatory status)
    const handleEditEvaluation = async (trackIdx: number, groupIdx: number, criterionIdx: number, evalIdx: number, field: 'name' | 'weight' | 'description' | 'mandatory', value: string | number | boolean) => {
        const track = tracksWithCriteria[trackIdx];
        const group = track?.CriterionGroup[groupIdx];
        const configuredCriterion = group?.configuredCriteria[criterionIdx];
        
        if (!track || !group || !configuredCriterion) return;

        try {
            if (field === 'mandatory') {
                await updateCriterionInTrack(track.id, configuredCriterion.criterionId, { mandatory: value as boolean });
            } else if (field === 'name') {
                await updateRhCriterion(configuredCriterion.criterionId, { name: value as string });
            }
            
            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
        } catch (error) {
            console.error('Error updating evaluation:', error);
            alert('Erro ao atualizar avaliação');
        }
    };

    // Add a new evaluation to a criterion (this would need backend implementation for evaluations)
    const handleAddEvaluation = (trackIdx: number, groupIdx: number, criterionIdx: number) => {
        // This would need backend implementation for evaluations
        console.log('Add evaluation not implemented yet');
    };

    // Save all changes
    const handleSave = async () => {
        try {
            setSaving(true);
            // Here you could implement bulk save if needed
            console.log('Salvando critérios:', tracksWithCriteria);
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
                        {tracksWithCriteria.map((track, trackIdx) => (
                            <div key={track.id}>
                                <RHCriteriaBox
                                    trackName={track.name}
                                    criteria={track.CriterionGroup.map(group => ({
                                        name: group.name,
                                        evaluations: group.configuredCriteria.map(cc => ({
                                            name: cc.criterion.displayName,
                                            mandatory: cc.mandatory,
                                            weight: cc.criterion.weight,
                                            description: cc.criterion.generalDescription
                                        }))
                                    }))}
                                    availableCriteria={criteria}
                                    isExpanded={openBoxIndex === trackIdx}
                                    onToggle={() => setOpenBoxIndex(openBoxIndex === trackIdx ? null : trackIdx)}
                                    onAddCriterion={() => {
                                        // For now, add to the first group if it exists
                                        if (track.CriterionGroup.length > 0) {
                                            handleAddCriterion(trackIdx, 0);
                                        }
                                    }}
                                    onAddPilar={() => handleAddPilar(trackIdx)}
                                    onDeleteTrack={() => handleDeleteTrack(trackIdx)}
                                    onDeleteCriterio={(criterionIdx) => {
                                        // For now, delete from the first group
                                        if (track.CriterionGroup.length > 0) {
                                            handleDeleteCriterio(trackIdx, 0, criterionIdx);
                                        }
                                    }}
                                    onDeleteCriterioFromGroup={(groupIdx, criterionIdx) => handleDeleteCriterio(trackIdx, groupIdx, criterionIdx)}
                                    onDeleteCriterionGroup={(groupIdx) => handleDeleteCriterionGroup(trackIdx, groupIdx)}
                                    onDeleteEvaluation={(criterionIdx, evalIdx) => handleDeleteEvaluation(trackIdx, 0, criterionIdx, evalIdx)}
                                    editingTrackIdx={editingTrackIdx}
                                    setEditingTrackIdx={setEditingTrackIdx}
                                    editingTrackName={editingTrackName}
                                    setEditingTrackName={setEditingTrackName}
                                    handleTrackNameSave={handleTrackNameSave}
                                    handleTrackNameKeyDown={(e, idx) => handleTrackNameKeyDown(e, idx)}
                                    trilhaIdx={trackIdx}
                                    onEditCriterion={(criterionIdx, newName) => handleEditCriterion(trackIdx, 0, criterionIdx, newName)}
                                    onEditEvaluation={(criterionIdx, evalIdx, field, value) => handleEditEvaluation(trackIdx, 0, criterionIdx, evalIdx, field, value)}
                                    onAddEvaluation={(groupIdx) => handleAddCriterionToGroup(trackIdx, groupIdx)}
                                    onEditCriterionGroup={(groupIdx, newName) => handleEditCriterionGroup(trackIdx, groupIdx, newName)}
                                    onAddCriterionToGroup={(groupIdx, criterion) => handleAddCriterionToGroupFromDropdown(trackIdx, groupIdx, criterion)}
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