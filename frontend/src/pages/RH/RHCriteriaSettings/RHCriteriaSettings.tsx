import { useState, useEffect, useCallback } from 'react';
import CollaboratorsSearchBar from '../../../components/CollaboratorsSearchBar';
import RHCriteriaBox from '../../../components/RH/RHCriteria/RHCriteriaBox';
import { IoFunnel } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
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
    weight: number;
    description: string;
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
    const [trackSearchTerm, setTrackSearchTerm] = useState("");
    
    // Add loading state for individual toggles
    const [togglingCriteria, setTogglingCriteria] = useState<Set<string>>(new Set());

    // Data from backend
    const [tracksWithCriteria, setTracksWithCriteria] = useState<TrackWithCriteria[]>([]);
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    
    // Local state for UI
    const [editingTrackIdx, setEditingTrackIdx] = useState<number | null>(null);
    const [editingTrackName, setEditingTrackName] = useState('');
    
    // Track last update time
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

    // Helper function to update last update time
    const updateLastModifiedTime = () => {
        setLastUpdateTime(new Date());
    };

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

        // If the user enters an empty string, save as a single space
        const newName = editingTrackName.trim() === '' ? "Nome da trilha" : editingTrackName;

        try {
            await updateTrack(track.id, { name: newName });
            setTracksWithCriteria(prev => prev.map((t, tIdx) =>
                tIdx === idx ? { ...t, name: newName } : t
            ));
            setEditingTrackIdx(null);
            updateLastModifiedTime();
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
            updateLastModifiedTime();
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
            updateLastModifiedTime();
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
            updateLastModifiedTime();
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
                false,
                availableCriterion.generalDescription,
                availableCriterion.weight
            );

            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
            updateLastModifiedTime();
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
            updateLastModifiedTime();
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

            // Prevent adding duplicate criterion
            const alreadyExists = group.configuredCriteria.some(cc => cc.criterionId === selectedCriterion.id);
            if (alreadyExists) {
                alert('Este critério já está associado a este pilar');
                return;
            }

            // Add criterion to the specific group
            await addCriterionToGroup(
                group.id,
                selectedCriterion.id,
                track.id,
                group.unitId,
                group.positionId,
                false,
                selectedCriterion.generalDescription,
                selectedCriterion.weight
            );

            // Refresh data
            const updatedTracks = await getTracksWithCriteria();
            setTracksWithCriteria(updatedTracks);
            updateLastModifiedTime();
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
            updateLastModifiedTime();
            
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
            updateLastModifiedTime();
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
            updateLastModifiedTime();
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
            updateLastModifiedTime();
        } catch (error) {
            console.error('Error updating criterion:', error);
            alert('Erro ao atualizar critério');
        }
    };

    // Optimized edit evaluation function with optimistic updates
    const handleEditEvaluation = useCallback(async (
        trackIdx: number, 
        groupIdx: number, 
        criterionIdx: number, 
        evalIdx: number, 
        field: 'name' | 'weight' | 'description' | 'mandatory', 
        value: string | number | boolean
    ) => {
        const track = tracksWithCriteria[trackIdx];
        const group = track?.CriterionGroup[groupIdx];
        const configuredCriterion = group?.configuredCriteria[criterionIdx];
        
        if (!track || !group || !configuredCriterion) return;

        const toggleKey = `${trackIdx}-${groupIdx}-${criterionIdx}`;

        if (field === 'mandatory') {
            setTogglingCriteria(prev => new Set(prev).add(toggleKey));
            setTracksWithCriteria(prev => prev.map((t, tIdx) => 
                tIdx === trackIdx 
                    ? {
                        ...t,
                        CriterionGroup: t.CriterionGroup.map((g, gIdx) => 
                            gIdx === groupIdx 
                                ? {
                                    ...g,
                                    configuredCriteria: g.configuredCriteria.map((cc, ccIdx) => 
                                        ccIdx === criterionIdx 
                                            ? { ...cc, mandatory: value as boolean }
                                            : cc
                                    )
                                }
                                : g
                        )
                    }
                    : t
            ));
            try {
                await updateCriterionInTrack(track.id, configuredCriterion.criterionId, { mandatory: value as boolean });
            } catch (error) {
                console.error('Error updating evaluation:', error);
                alert('Erro ao atualizar avaliação');
                setTracksWithCriteria(prev => prev.map((t, tIdx) => 
                    tIdx === trackIdx 
                        ? {
                            ...t,
                            CriterionGroup: t.CriterionGroup.map((g, gIdx) => 
                                gIdx === groupIdx 
                                    ? {
                                        ...g,
                                        configuredCriteria: g.configuredCriteria.map((cc, ccIdx) => 
                                            ccIdx === criterionIdx 
                                                ? { ...cc, mandatory: !value as boolean }
                                                : cc
                                        )
                                    }
                                    : g
                            )
                        }
                        : t
                ));
            } finally {
                setTogglingCriteria(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(toggleKey);
                    return newSet;
                });
            }
        } else if (field === 'weight' || field === 'description') {
            // Log the context and new value
            console.log('[Edit ConfiguredCriterion]', {
                track: track.name,
                pillar: group.name,
                criterion: configuredCriterion.criterion.displayName,
                field,
                newValue: value
            });
            try {
                await updateCriterionInTrack(track.id, configuredCriterion.criterionId, {
                    [field]: value
                });
                const updatedTracks = await getTracksWithCriteria();
                setTracksWithCriteria(updatedTracks);
            } catch (error) {
                console.error('Error updating evaluation:', error);
                alert('Erro ao atualizar avaliação');
            }
        } else if (field === 'name') {
            // (Optional: only if you want to update the global criterion)
            try {
                await updateRhCriterion(configuredCriterion.criterionId, {
                    name: value as string,
                    generalDescription: configuredCriterion.criterion.generalDescription,
                    active: configuredCriterion.criterion.active,
                });
                const updatedTracks = await getTracksWithCriteria();
                setTracksWithCriteria(updatedTracks);
            } catch (error) {
                console.error('Error updating evaluation:', error);
                alert('Erro ao atualizar avaliação');
            }
        }
    }, [tracksWithCriteria]);


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

    // Filtered tracks by search term
    const filteredTracks = trackSearchTerm.trim() === ""
        ? tracksWithCriteria
        : tracksWithCriteria.filter(track =>
            track.name.toLowerCase().includes(trackSearchTerm.toLowerCase())
        );

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex flex-col">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Critérios de Avaliação</h1>
                    {lastUpdateTime && (
                        <span className="text-sm text-gray-500 mt-1">
                            Última atualização: {lastUpdateTime.toLocaleDateString('pt-BR')}
                        </span>
                    )}
                </div>
                <button 
                    className="bg-[#08605F] text-white px-3 sm:px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-300 mb-4 sm:mb-6">
                <button
                    className={`px-3 sm:px-4 py-2 text-sm font-medium ${activeTab === 'track' ? 'border-b-2 border-[#08605F] text-[#08605F]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('track')}
                >
                    Trilha
                </button>
                <button
                    className={`px-3 sm:px-4 py-2 text-sm font-medium ${activeTab === 'unit' ? 'border-b-2 border-[#08605F] text-[#08605F]' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('unit')}
                >
                    Unidade
                </button>
            </div>

            {/* Content */}
            {activeTab === 'track' && (
                <div>
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-4 sm:mb-6">
                        <div className="flex-grow w-full">
                            {/* Track search bar styled like CollaboratorsSearchBar */}
                            <div className="flex items-center gap-2 rounded-xl py-3 sm:py-4 px-4 sm:px-7 w-full bg-white">
                                <IoIosSearch size={16} className="text-[#1D1D1D]/75 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Buscar trilha"
                                    className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
                                    value={trackSearchTerm}
                                    onChange={e => setTrackSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="bg-[#08605F] p-3 rounded-md text-white flex-shrink-0">
                            <IoFunnel size={20} className="sm:w-6 sm:h-6" />
                        </div>
                    </div>
                    {/* Criteria Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                        <span className="font-semibold text-base sm:text-lg text-gray-700">Trilha</span>
                        <button
                            className="px-2 py-1 text-xs bg-gray-100 text-[#08605F] rounded hover:bg-gray-200 transition-colors w-full sm:w-auto"
                            onClick={handleAddCriteriaGroup}
                        >
                            Adicionar Trilha
                        </button>
                    </div>
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {filteredTracks.map((track, trackIdx) => (
                            <div key={track.id}>
                                <RHCriteriaBox
                                    trackName={track.name}
                                    criteria={track.CriterionGroup.map(group => ({
                                        name: group.name,
                                        evaluations: group.configuredCriteria.map(cc => ({
                                            name: cc.criterion.displayName,
                                            mandatory: cc.mandatory,
                                            weight: cc.weight, // use ConfiguredCriterion's weight
                                            description: cc.description // use ConfiguredCriterion's description
                                        }))
                                    }))}
                                    availableCriteria={criteria as any}
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
                                    onEditEvaluation={(criterionIdx, evalIdx, field, value) => handleEditEvaluation(trackIdx, criterionIdx, evalIdx, 0, field, value)}
                                    onAddEvaluation={(groupIdx) => handleAddCriterionToGroup(trackIdx, groupIdx)}
                                    onEditCriterionGroup={(groupIdx, newName) => handleEditCriterionGroup(trackIdx, groupIdx, newName)}
                                    onAddCriterionToGroup={(groupIdx, criterion) => handleAddCriterionToGroupFromDropdown(trackIdx, groupIdx, criterion)}
                                    togglingCriteria={togglingCriteria}
                                />
                            </div>
                        ))}
                        {filteredTracks.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                Nenhuma trilha encontrada
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'unit' && (
                <div className="text-center p-6 sm:p-8">
                    <h2 className="text-lg sm:text-xl text-gray-500">A seção Unidade está em desenvolvimento.</h2>
                </div>
            )}
        </div>
    );
}

export default RhCriteriaSettings;