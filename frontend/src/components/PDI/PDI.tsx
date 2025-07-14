import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, UserIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { fetchPdiByUser, createPdi, updatePdi, deletePdi, createPdiAction, updatePdiAction, deletePdiAction, fetchManagerCollaborators } from '../../services/api';

// 1. Atualizar o tipo PDIAction para incluir metas (goals)
interface PDIGoal {
  id: string;
  descricao: string;
  concluida: boolean;
}

interface PDIAction {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'knowledge' | 'behavior' | 'career';
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in_progress' | 'completed';
  dueDate: string;
  progress: number;
  goals?: PDIGoal[];
}

interface PDICollaborator {
  id: string;
  name: string;
  position: string;
  department: string;
  actions: PDIAction[];
  pdiId?: string; // Adicionado pdiId
}

interface PDIProps {
  userRole?: string;
  title?: string;
  description?: string;
}

const PDI: React.FC<PDIProps> = ({ 
  userRole = 'manager',
  title = 'PDI - Plano de Desenvolvimento Individual',
  description = 'Acompanhe o desenvolvimento dos seus colaboradores'
}) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<PDICollaborator[]>([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [showAddAction, setShowAddAction] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  // 2. Atualizar o estado de newAction para incluir metas
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    category: 'skill' as const,
    priority: 'medium' as const,
    dueDate: '',
    goals: [] as PDIGoal[],
  });
  // Novo estado para criação de PDI
  const [showCreatePdi, setShowCreatePdi] = useState(false);
  const [newPdi, setNewPdi] = useState({ title: '', description: '' });
  // Novo estado para seleção de PDI
  const [userPdis, setUserPdis] = useState<any[]>([]); // lista de PDIs do usuário
  const [selectedPdiId, setSelectedPdiId] = useState<string | null>(null);
  // Adicionar estado para dropdown do PDI
  const [showPdiDropdown, setShowPdiDropdown] = useState(false);
  const [managerCollaborators, setManagerCollaborators] = useState<any[]>([]);
  const [selectedManagerCollaboratorId, setSelectedManagerCollaboratorId] = useState<string | null>(null);
  // Adicionar estado para filtro de busca de colaborador
  const [managerCollaboratorFilter, setManagerCollaboratorFilter] = useState('');
  const [showManagerCollaboratorList, setShowManagerCollaboratorList] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPdiByUser(user.id).then((pdis) => {
        setUserPdis(pdis);
        if (pdis.length > 0) {
          // Se só houver um PDI, seleciona automaticamente
          setSelectedPdiId(pdis.length === 1 ? pdis[0].id.toString() : null);
          // Atualiza colaboradores para o PDI selecionado (se só houver um)
          if (pdis.length === 1) {
            const pdi = pdis[0];
            setCollaborators([
              {
                id: user.id.toString(),
                name: user.name,
                position: user.position || '',
                department: user.unit || '',
                pdiId: pdi.id,
                actions: pdi.actions.map((a: any) => ({
                  ...a,
                  id: a.id.toString(),
                })),
              },
            ]);
            setSelectedCollaborator(user.id.toString());
          } else {
            setCollaborators([]);
            setSelectedCollaborator(null);
          }
        } else {
          setUserPdis([]);
          setCollaborators([]);
          setSelectedCollaborator(null);
        }
      });
    }
  }, [user]);

  // Quando seleciona um PDI, atualiza as ações exibidas
  useEffect(() => {
    if (selectedPdiId && userPdis.length > 0 && user) {
      const pdi = userPdis.find((p) => p.id.toString() === selectedPdiId);
      if (pdi) {
        setCollaborators(collaborators.map(collab => 
          collab.id === selectedCollaborator
            ? { ...collab, actions: pdi.actions.map((a: any) => ({
                  ...a,
                  id: a.id.toString(),
                })) }
            : collab
        ));
        setSelectedCollaborator(user.id.toString());
      }
    }
  }, [selectedPdiId, userPdis, user]);

  // Buscar colaboradores do gestor ao carregar, se for manager
  useEffect(() => {
    if (userRole === 'manager' && user && user.id) {
      fetchManagerCollaborators(user.id).then((collabs) => {
        setManagerCollaborators(collabs);
        if (collabs.length > 0) {
          setSelectedManagerCollaboratorId(collabs[0].id.toString());
        }
      });
    }
  }, [userRole, user]);
  // Corrigir chamada de fetchPdiByUser para receber number
  useEffect(() => {
    if (userRole === 'manager' && selectedManagerCollaboratorId) {
      fetchPdiByUser(Number(selectedManagerCollaboratorId)).then((pdis) => {
        setUserPdis(pdis);
        if (pdis.length > 0) {
          setSelectedPdiId(pdis[0].id.toString());
          setCollaborators([
            {
              id: selectedManagerCollaboratorId,
              name: managerCollaborators.find(c => c.id.toString() === selectedManagerCollaboratorId)?.name || '',
              position: managerCollaborators.find(c => c.id.toString() === selectedManagerCollaboratorId)?.position || '',
              department: managerCollaborators.find(c => c.id.toString() === selectedManagerCollaboratorId)?.department || '',
              pdiId: pdis[0].id,
              actions: pdis[0].actions.map((a: any) => ({ ...a, id: a.id.toString() })),
            },
          ]);
          setSelectedCollaborator(selectedManagerCollaboratorId);
        } else {
          setCollaborators([]);
          setSelectedCollaborator(null);
        }
      });
    }
  }, [userRole, selectedManagerCollaboratorId, managerCollaborators]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'knowledge':
        return <UserIcon className="w-5 h-5" />;
      case 'behavior':
        return <BriefcaseIcon className="w-5 h-5" />;
      case 'career':
        return <BriefcaseIcon className="w-5 h-5" />;
      default:
        return <UserIcon className="w-5 h-5" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'skill':
        return 'Habilidade';
      case 'knowledge':
        return 'Conhecimento';
      case 'behavior':
        return 'Comportamento';
      case 'career':
        return 'Carreira';
      default:
        return 'Outro';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planejado';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      default:
        return 'Desconhecido';
    }
  };

  // 3. Funções para manipular metas no formulário
  const handleAddGoal = () => {
    setNewAction((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        { id: Date.now().toString(), descricao: '', concluida: false },
      ],
    }));
  };
  const handleRemoveGoal = (goalId: string) => {
    setNewAction((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId),
    }));
  };
  const handleGoalChange = (goalId: string, value: string) => {
    setNewAction((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, descricao: value } : g
      ),
    }));
  };

  // 4. Atualizar handleAddAction para enviar metas e calcular progresso
  const handleAddAction = () => {
    if (newAction.title.trim() && selectedCollaborator) {
      const pdiId = collaborators.find(c => c.id === selectedCollaborator)?.pdiId;
      if (!pdiId) return;
      const dueDateISO = newAction.dueDate ? new Date(newAction.dueDate).toISOString() : new Date().toISOString();
      // Calcular progresso baseado nas metas
      let progress = 0;
      if (newAction.goals && newAction.goals.length > 0) {
        const total = newAction.goals.length;
        const done = newAction.goals.filter(g => g.concluida).length;
        progress = Math.round((done / total) * 100);
      }
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
      }).then((created) => {
        setCollaborators(collaborators.map(collab =>
          collab.id === selectedCollaborator
            ? { ...collab, actions: [...collab.actions, {
                id: created.id.toString(),
                title: newAction.title,
                description: newAction.description,
                category: newAction.category,
                priority: newAction.priority,
                status: 'planned',
                dueDate: dueDateISO,
                progress,
                goals: newAction.goals,
              }] }
            : collab
        ));
        setNewAction({
          title: '',
          description: '',
          category: 'skill',
          priority: 'medium',
          dueDate: '',
          goals: [],
        });
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
    if (!user) return;
    if (!newPdi.title.trim()) return;
    await createPdi({ userId: user.id, title: newPdi.title, description: newPdi.description });
    setShowCreatePdi(false);
    setNewPdi({ title: '', description: '' });
    // Refaz o fetch para atualizar
    fetchPdiByUser(user.id).then((pdis) => {
      if (pdis.length > 0) {
        const pdi = pdis[0];
        setCollaborators([
          {
            id: user.id.toString(),
            name: user.name,
            position: user.position || '',
            department: user.unit || '',
            pdiId: pdi.id,
            actions: pdi.actions.map((a: any) => ({
              ...a,
              id: a.id.toString(),
            })),
          },
        ]);
        setSelectedCollaborator(user.id.toString());
      }
    });
  };

  const selectedCollaboratorData = collaborators.find(c => c.id === selectedCollaborator);

  // 7. Função para marcar/desmarcar metas e atualizar progresso
  const handleToggleGoal = (collaboratorId: string, actionId: string, goalId: string, checked: boolean) => {
    const collab = collaborators.find(c => c.id === collaboratorId);
    if (!collab) return;
    const action = collab.actions.find(a => a.id === actionId);
    if (!action || !action.goals) return;
    const newGoals = action.goals.map(g => g.id === goalId ? { ...g, concluida: checked } : g);
    const total = newGoals.length;
    const done = newGoals.filter(g => g.concluida).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    // Atualizar no backend
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

  return (
    <div className="pt-16 px-2 sm:px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{description}</p>
        </div>
        {/* Remover autocomplete e adicionar filtro estilo lista de botões */}
        {userRole === 'manager' && managerCollaborators.length > 0 && (
          <div className="mb-4 w-full max-w-lg">
          </div>
        )}
        {/* Bloco de seleção de planos e '+ Novo Plano' no topo */}
        {userRole === 'collaborator' && userPdis.length > 0 && (
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Plano:</span>
              <span className="font-bold text-lg">
                {selectedPdiId && userPdis.find(pdi => pdi.id.toString() === selectedPdiId)?.title}
              </span>
              <div className="relative inline-block ml-2">
                <button
                  className="text-sm text-green-700 border border-green-600 rounded px-2 py-1 hover:bg-green-50 transition-colors"
                  onClick={e => setShowPdiDropdown(v => !v)}
                  type="button"
                >
                  Mudar Plano
                </button>
                {showPdiDropdown && (
                  <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg min-w-[180px]">
                    {userPdis.map((pdi) => (
                      <button
                        key={pdi.id}
                        onClick={() => {
                          setSelectedPdiId(pdi.id.toString());
                          setShowPdiDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-green-100 ${selectedPdiId === pdi.id.toString() ? 'bg-green-50 font-bold' : ''}`}
                      >
                        {pdi.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              className="text-sm text-green-700 border border-dashed border-green-600 rounded px-2 py-1 hover:bg-green-50 transition-colors"
              onClick={() => setShowCreatePdi(true)}
              type="button"
            >
              + Novo Plano
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Só mostra a lista se não for colaborador */}
          {userRole !== 'collaborator' && (
            <div className="w-full">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Colaboradores</h2>
              {/* Filtro de busca por nome */}
              <input
                type="text"
                placeholder="Buscar colaborador..."
                className="border rounded px-2 py-1 w-full mb-4"
                value={managerCollaboratorFilter}
                onChange={e => setManagerCollaboratorFilter(e.target.value)}
              />
              <div className="space-y-2">
                {managerCollaboratorFilter.trim() !== '' ? (
                  collaborators
                    .filter(collab => collab.name.toLowerCase().includes(managerCollaboratorFilter.toLowerCase()))
                    .map((collab) => (
                      <button
                        key={collab.id}
                        onClick={() => setSelectedCollaborator(collab.id)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          selectedCollaborator === collab.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                            {collab.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{collab.name}</p>
                            <p className="text-sm text-gray-600 truncate">{collab.position}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {collab.actions.length} ação{collab.actions.length !== 1 ? 'ões' : ''}
                        </div>
                      </button>
                    ))
                ) : null}
                {managerCollaboratorFilter.trim() !== '' && collaborators.filter(collab => collab.name.toLowerCase().includes(managerCollaboratorFilter.toLowerCase())).length === 0 && (
                  <div className="text-gray-400 px-2 py-4">Nenhum colaborador encontrado</div>
                )}
              </div>
            </div>
          )}

          {/* Detalhes do Colaborador ou do próprio usuário */}
          <div className="w-full">
            {userRole === 'collaborator' && collaborators.length === 0 && !showCreatePdi && (
              <div className="text-center py-12">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Você ainda não possui um PDI cadastrado</h3>
                <p className="text-sm text-gray-500 mb-4">Crie seu plano de desenvolvimento individual para começar a adicionar ações.</p>
                <button
                  onClick={() => setShowCreatePdi(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Criar meu PDI
                </button>
              </div>
            )}
            {userRole === 'collaborator' && showCreatePdi ? (
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Novo PDI</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={newPdi.title}
                    onChange={e => setNewPdi({ ...newPdi, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Meu Plano 2024"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={newPdi.description}
                    onChange={e => setNewPdi({ ...newPdi, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva seu objetivo de desenvolvimento..."
                  />
                </div>
                <button
                  onClick={handleCreatePdi}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
                >
                  Salvar PDI
                </button>
                <button
                  onClick={() => setShowCreatePdi(false)}
                  className="mt-2 w-full text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              selectedCollaboratorData ? (
                <div>
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full max-w-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg">
                        {selectedCollaboratorData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                          {userRole === 'collaborator' && selectedPdiId
                            ? (userPdis.find(pdi => pdi.id.toString() === selectedPdiId)?.title || 'Plano de Desenvolvimento')
                            : selectedCollaboratorData.name}
                        </h2>
                        <p className="text-gray-600">{selectedCollaboratorData.position} • {selectedCollaboratorData.department}</p>
                      </div>
                    </div>
                    {/* Botão Nova Ação dentro do card do PDI */}
                    {selectedCollaborator && (
                      <button
                        onClick={() => setShowAddAction(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors mb-6"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Nova Ação
                      </button>
                    )}

                    {/* Formulário de nova ação */}
                    {showAddAction && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Nova Ação de Desenvolvimento</h3>
                          <button
                            onClick={() => setShowAddAction(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-6 h-6" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Título da Ação
                            </label>
                            <input
                              type="text"
                              value={newAction.title}
                              onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Ex: Melhorar habilidades de liderança"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Categoria
                            </label>
                            <select
                              value={newAction.category}
                              onChange={(e) => setNewAction({...newAction, category: e.target.value as any})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="skill">Habilidade</option>
                              <option value="knowledge">Conhecimento</option>
                              <option value="behavior">Comportamento</option>
                              <option value="career">Carreira</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Prioridade
                            </label>
                            <select
                              value={newAction.priority}
                              onChange={(e) => setNewAction({...newAction, priority: e.target.value as any})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="low">Baixa</option>
                              <option value="medium">Média</option>
                              <option value="high">Alta</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Data de Conclusão
                            </label>
                            <input
                              type="date"
                              value={newAction.dueDate}
                              onChange={(e) => setNewAction({...newAction, dueDate: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descrição
                            </label>
                            <textarea
                              value={newAction.description}
                              onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              rows={3}
                              placeholder="Descreva a ação de desenvolvimento..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Metas (Checklist)
                            </label>
                            {newAction.goals.map((goal, idx) => (
                              <div key={goal.id} className="flex items-center gap-2 mb-2">
                                <input
                                  type="text"
                                  value={goal.descricao}
                                  onChange={e => handleGoalChange(goal.id, e.target.value)}
                                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                                  placeholder={`Meta ${idx + 1}`}
                                />
                                <button type="button" onClick={() => handleRemoveGoal(goal.id)} className="text-red-500 px-2">Remover</button>
                              </div>
                            ))}
                            <button type="button" onClick={handleAddGoal} className="text-green-600 font-medium mt-2">+ Adicionar Meta</button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleAddAction}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Salvar Ação
                          </button>
                          <button
                            onClick={() => setShowAddAction(false)}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lista de Ações */}
                    <div className="space-y-4">
                      {selectedCollaboratorData.actions.length > 0 ? (
                        <div className="flex flex-col gap-8 items-center w-full">
                          {selectedCollaboratorData.actions.map((action) => (
                            <div
                              key={action.id}
                              className="bg-white border border-gray-200 rounded-2xl p-12 min-h-[180px] w-full max-w-full flex flex-col justify-between shadow-md"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getCategoryIcon(action.category)}
                                    <h3 className="text-xl font-bold text-gray-900">{action.title}</h3>
                                  </div>
                                  <p className="text-gray-600 text-base mb-3">{action.description}</p>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className={`px-2 py-1 rounded-full font-medium ${getCategoryText(action.category)}`}>
                                      {getCategoryText(action.category)}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(action.priority)}`}>
                                      {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(action.status)}`}>
                                      {getStatusText(action.status)}
                                    </span>
                                    <span className="text-gray-500">
                                      Vencimento: {new Date(action.dueDate).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingActionId(editingActionId === action.id ? null : action.id)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAction(selectedCollaboratorData.id, action.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              {/* Progresso */}
                              <div className="mb-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">Progresso</span>
                                  <span className="text-sm text-gray-600">{action.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${action.progress}%` }}
                                  />
                                </div>
                                {editingActionId === action.id && (
                                  <div className="mt-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={action.progress}
                                      onChange={(e) => handleUpdateActionProgress(selectedCollaboratorData.id, action.id, parseInt(e.target.value))}
                                      className="w-full"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Metas (Checklist) */}
                              {action.goals && action.goals.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-semibold mb-2">Checklist</h4>
                                  <ul className="space-y-2">
                                    {action.goals.map((goal, idx) => (
                                      <li key={goal.id} className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={goal.concluida}
                                          onChange={e => handleToggleGoal(selectedCollaboratorData.id, action.id, goal.id, e.target.checked)}
                                        />
                                        <span className={goal.concluida ? 'line-through text-gray-400' : ''}>{goal.descricao}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhuma ação de desenvolvimento</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Comece criando ações de desenvolvimento
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um colaborador</h3>
                  <p className="text-sm text-gray-500">
                    Escolha um colaborador da lista para visualizar e gerenciar seu PDI.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDI; 