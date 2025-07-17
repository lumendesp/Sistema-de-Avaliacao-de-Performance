import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchPdiByUser, createPdi, updatePdi, deletePdi, createPdiAction, updatePdiAction, deletePdiAction, fetchManagerCollaborators } from '../../services/api';
import type { PDICollaborator, NewActionData, NewPdiData, PDIAction } from './types';
import { calculateProgress } from './utils';

export const usePDI = (userRole: string) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<PDICollaborator[]>([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [showAddAction, setShowAddAction] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [newAction, setNewAction] = useState<NewActionData>({
    title: '',
    description: '',
    category: 'skill',
    priority: 'medium',
    dueDate: '',
    goals: [{ id: Date.now().toString(), descricao: '', concluida: false }],
  });
  const [actionErrors, setActionErrors] = useState<{[key: string]: string}>({});
  const [showCreatePdi, setShowCreatePdi] = useState(false);
  const [newPdi, setNewPdi] = useState<NewPdiData>({ title: '', description: '' });
  const [userPdis, setUserPdis] = useState<any[]>([]);
  const [selectedPdiId, setSelectedPdiId] = useState<string | null>(null);
  const [showPdiDropdown, setShowPdiDropdown] = useState(false);
  const [managerCollaborators, setManagerCollaborators] = useState<any[]>([]);
  const [selectedManagerCollaboratorId, setSelectedManagerCollaboratorId] = useState<string | null>(null);
  const [managerCollaboratorFilter, setManagerCollaboratorFilter] = useState('');
  const [showManagerCollaboratorList, setShowManagerCollaboratorList] = useState(false);
  const [editActionData, setEditActionData] = useState<null | (PDIAction & {collaboratorId: string})>(null);
  const [showCreatePdiForCollaborator, setShowCreatePdiForCollaborator] = useState(false);
  const [newPdiForCollaborator, setNewPdiForCollaborator] = useState<NewPdiData>({ title: '', description: '' });
  const [selectedCollaboratorPdis, setSelectedCollaboratorPdis] = useState<any[]>([]);
  const [selectedCollaboratorPdiId, setSelectedCollaboratorPdiId] = useState<string | null>(null);

  // Carregar PDIs do usuário
  useEffect(() => {
    if (user) {
      fetchPdiByUser(user.id).then((pdis) => {
        setUserPdis(pdis);
        if (pdis.length > 0) {
          const mostRecentPdi = pdis[pdis.length - 1];
          setSelectedPdiId(mostRecentPdi.id.toString());
          setCollaborators([
            {
              id: user.id.toString(),
              name: user.name,
              position: '',
              department: '',
              pdiId: mostRecentPdi.id,
              actions: mostRecentPdi.actions.map((a: any) => ({
                ...a,
                id: a.id.toString(),
              })),
            },
          ]);
          setSelectedCollaborator(user.id.toString());
        } else {
          setUserPdis([]);
          setCollaborators([]);
          setSelectedCollaborator(null);
        }
      });
    }
  }, [user]);

  // Buscar colaboradores do gestor
  useEffect(() => {
    if (userRole === 'manager' && user && user.id) {
      fetchManagerCollaborators(user.id).then((collabs) => {
        setManagerCollaborators(collabs);
        if (collabs.length > 0) {
          setSelectedManagerCollaboratorId(collabs[0].id.toString());
        }
        Promise.all(
          collabs.map((collab: any) =>
            fetchPdiByUser(Number(collab.id)).then((pdis) => ({
              ...collab,
              pdiId: pdis[0]?.id,
              actions: pdis[0]?.actions?.map((a: any) => ({ ...a, id: a.id.toString() })) || [],
            }))
          )
        ).then((collaboratorsWithPdi) => {
          setCollaborators(collaboratorsWithPdi);
        });
      });
    }
  }, [userRole, user]);

  // Atualizar colaborador selecionado
  useEffect(() => {
    if (userRole === 'manager' && selectedManagerCollaboratorId) {
      fetchPdiByUser(Number(selectedManagerCollaboratorId)).then((pdis) => {
        setCollaborators(prev => prev.map(collab =>
          collab.id === selectedManagerCollaboratorId
            ? {
                ...collab,
                pdiId: pdis[0]?.id,
                actions: pdis[0]?.actions?.map((a: any) => ({ ...a, id: a.id.toString() })) || [],
              }
            : collab
        ));
        setSelectedCollaborator(selectedManagerCollaboratorId);
      });
    }
  }, [userRole, selectedManagerCollaboratorId, managerCollaborators]);

  // Atualizar PDIs do colaborador selecionado
  useEffect(() => {
    if (userRole === 'manager' && selectedCollaborator) {
      fetchPdiByUser(Number(selectedCollaborator)).then((pdis) => {
        setSelectedCollaboratorPdis(pdis);
        if (pdis.length > 0) {
          setSelectedCollaboratorPdiId(pdis[0].id.toString());
          setCollaborators(prev => prev.map(collab =>
            collab.id === selectedCollaborator
              ? {
                  ...collab,
                  pdiId: pdis[0].id,
                  actions: pdis[0].actions.map((a: any) => ({ ...a, id: a.id.toString() })),
                }
              : collab
          ));
        }
      });
    }
  }, [userRole, selectedCollaborator]);

  // Atualizar ações quando trocar PDI
  useEffect(() => {
    if (userRole === 'manager' && selectedCollaborator && selectedCollaboratorPdiId && selectedCollaboratorPdis.length > 0) {
      const pdi = selectedCollaboratorPdis.find(p => p.id.toString() === selectedCollaboratorPdiId);
      if (pdi) {
        setCollaborators(prev => prev.map(collab =>
          collab.id === selectedCollaborator
            ? {
                ...collab,
                pdiId: pdi.id,
                actions: pdi.actions.map((a: any) => ({ ...a, id: a.id.toString() })),
            }
          : collab
        ));
      }
    }
  }, [userRole, selectedCollaborator, selectedCollaboratorPdiId, selectedCollaboratorPdis]);

  const handleAddAction = () => {
    const errors: {[key: string]: string} = {};
    if (!newAction.title.trim()) errors.title = 'Título obrigatório';
    if (!newAction.dueDate) errors.dueDate = 'Data obrigatória';
    if (!newAction.category) errors.category = 'Categoria obrigatória';
    if (!newAction.priority) errors.priority = 'Prioridade obrigatória';
    if (!newAction.goals.length || newAction.goals.some(g => !g.descricao.trim())) errors.goals = 'Preencha todas as metas';
    
    setActionErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (selectedCollaborator && user) {
      const pdiId = collaborators.find(c => c.id === selectedCollaborator)?.pdiId;
      if (!pdiId) return;
      
      const dueDateISO = newAction.dueDate ? new Date(newAction.dueDate).toISOString() : new Date().toISOString();
      const progress = calculateProgress(newAction.goals);
      
      createPdiAction({
        pdiId,
        title: newAction.title,
        description: newAction.description,
        category: newAction.category,
        priority: newAction.priority,
        status: 'planned',
        dueDate: dueDateISO,
        progress,
        goals: newAction.goals,
      }).then(() => {
        refreshCollaboratorData();
        resetNewAction();
        setShowAddAction(false);
      });
    }
  };

  const handleUpdateActionProgress = (collaboratorId: string, actionId: string, progress: number) => {
    updatePdiAction(Number(actionId), { progress }).then(() => {
      setCollaborators(collaborators.map(collab => 
        collab.id === collaboratorId
          ? {
              ...collab,
              actions: collab.actions.map(action =>
                action.id === actionId
                  ? { 
                      ...action, 
                      progress,
                      status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'planned'
                    }
                  : action
              )
            }
          : collab
      ));
    });
  };

  const handleDeleteAction = (collaboratorId: string, actionId: string) => {
    deletePdiAction(Number(actionId)).then(() => {
      setCollaborators(collaborators.map(collab => 
        collab.id === collaboratorId
          ? { ...collab, actions: collab.actions.filter(action => action.id !== actionId) }
          : collab
      ));
    });
  };

  const handleCreatePdi = async () => {
    if (!user || !newPdi.title.trim()) return;
    
    await createPdi({ userId: user.id, title: newPdi.title, description: newPdi.description });
    setShowCreatePdi(false);
    setNewPdi({ title: '', description: '' });
    refreshUserPdis();
  };

  const handleCreatePdiForCollaborator = async () => {
    if (!selectedCollaborator || !newPdiForCollaborator.title.trim()) return;
    
    await createPdi({ userId: Number(selectedCollaborator), title: newPdiForCollaborator.title, description: newPdiForCollaborator.description });
    setShowCreatePdiForCollaborator(false);
    setNewPdiForCollaborator({ title: '', description: '' });
    refreshCollaboratorData();
  };

  const handleToggleGoal = (collaboratorId: string, actionId: string, goalId: string, checked: boolean) => {
    const collab = collaborators.find(c => c.id === collaboratorId);
    if (!collab) return;
    
    const action = collab.actions.find(a => a.id === actionId);
    if (!action || !action.goals) return;
    
    const newGoals = action.goals.map(g => g.id === goalId ? { ...g, concluida: checked } : g);
    const progress = calculateProgress(newGoals);
    
    updatePdiAction(Number(actionId), { goals: newGoals, progress }).then(() => {
      setCollaborators(collaborators.map(collab =>
        collab.id === collaboratorId
          ? {
              ...collab,
              actions: collab.actions.map(a =>
                a.id === actionId
                  ? { ...a, goals: newGoals, progress, status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'planned' }
                  : a
              )
            }
          : collab
      ));
    });
  };

  const refreshCollaboratorData = () => {
    if (userRole === 'manager' && selectedCollaborator) {
      fetchPdiByUser(Number(selectedCollaborator)).then((pdis: any[]) => {
        const pdi = pdis[0];
        setCollaborators(collaborators.map(collab =>
          collab.id === selectedCollaborator
            ? {
                ...collab,
                pdiId: pdi.id,
                actions: pdi.actions.map((a: any) => ({ ...a, id: a.id.toString() })),
              }
            : collab
        ));
        setSelectedCollaboratorPdis(pdis);
        setSelectedCollaboratorPdiId(pdi.id.toString());
      });
    } else if (user) {
      fetchPdiByUser(user.id).then((pdis: any[]) => {
        setUserPdis(pdis);
        if (selectedPdiId) {
          const pdi = pdis.find((p: any) => p.id.toString() === selectedPdiId);
          if (pdi) {
            setCollaborators([
              {
                id: user.id.toString(),
                name: user.name,
                position: '',
                department: '',
                pdiId: pdi.id,
                actions: pdi.actions.map((a: any) => ({
                  ...a,
                  id: a.id.toString(),
                })),
              },
            ]);
            setSelectedCollaborator(user.id.toString());
          }
        }
      });
    }
  };

  const refreshUserPdis = () => {
    if (user) {
      fetchPdiByUser(user.id).then((pdis) => {
        if (pdis.length > 0) {
          const mostRecentPdi = pdis[pdis.length - 1];
          setUserPdis(pdis);
          setSelectedPdiId(mostRecentPdi.id.toString());
          setCollaborators([
            {
              id: user.id.toString(),
              name: user.name,
              position: '',
              department: '',
              pdiId: mostRecentPdi.id,
              actions: mostRecentPdi.actions.map((a: any) => ({
                ...a,
                id: a.id.toString(),
              })),
            },
          ]);
          setSelectedCollaborator(user.id.toString());
        }
      });
    }
  };

  const resetNewAction = () => {
    setNewAction({
      title: '',
      description: '',
      category: 'skill',
      priority: 'medium',
      dueDate: '',
      goals: [{ id: Date.now().toString(), descricao: '', concluida: false }],
    });
    setActionErrors({});
  };

  return {
    // Estado
    collaborators,
    selectedCollaborator,
    showAddAction,
    editingActionId,
    newAction,
    actionErrors,
    showCreatePdi,
    newPdi,
    userPdis,
    selectedPdiId,
    showPdiDropdown,
    managerCollaborators,
    selectedManagerCollaboratorId,
    managerCollaboratorFilter,
    showManagerCollaboratorList,
    editActionData,
    showCreatePdiForCollaborator,
    newPdiForCollaborator,
    selectedCollaboratorPdis,
    selectedCollaboratorPdiId,
    
    // Setters
    setSelectedCollaborator,
    setShowAddAction,
    setEditingActionId,
    setNewAction,
    setActionErrors,
    setShowCreatePdi,
    setNewPdi,
    setSelectedPdiId,
    setShowPdiDropdown,
    setSelectedManagerCollaboratorId,
    setManagerCollaboratorFilter,
    setShowManagerCollaboratorList,
    setEditActionData,
    setShowCreatePdiForCollaborator,
    setNewPdiForCollaborator,
    setSelectedCollaboratorPdiId,
    
    // Handlers
    handleAddAction,
    handleUpdateActionProgress,
    handleDeleteAction,
    handleCreatePdi,
    handleCreatePdiForCollaborator,
    handleToggleGoal,
    refreshCollaboratorData,
    refreshUserPdis,
    resetNewAction,
  };
}; 