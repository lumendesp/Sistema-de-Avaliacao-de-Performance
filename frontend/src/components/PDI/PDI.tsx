import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, UserIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface PDIAction {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'knowledge' | 'behavior' | 'career';
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in_progress' | 'completed';
  dueDate: string;
  progress: number;
}

interface PDICollaborator {
  id: string;
  name: string;
  position: string;
  department: string;
  actions: PDIAction[];
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
  const [collaborators, setCollaborators] = useState<PDICollaborator[]>([
    {
      id: '1',
      name: 'João Silva',
      position: 'Desenvolvedor Senior',
      department: 'Tecnologia',
      actions: [
        {
          id: '1',
          title: 'Melhorar habilidades de liderança',
          description: 'Participar de treinamentos de liderança e mentoring',
          category: 'skill',
          priority: 'high',
          status: 'in_progress',
          dueDate: '2024-12-31',
          progress: 60
        },
        {
          id: '2',
          title: 'Aprender React Native',
          description: 'Completar curso online e desenvolver projeto prático',
          category: 'knowledge',
          priority: 'medium',
          status: 'planned',
          dueDate: '2024-11-30',
          progress: 0
        }
      ]
    },
    {
      id: '2',
      name: 'Maria Santos',
      position: 'Analista de Marketing',
      department: 'Marketing',
      actions: [
        {
          id: '3',
          title: 'Desenvolver estratégias de conteúdo',
          description: 'Criar plano de conteúdo trimestral e implementar',
          category: 'skill',
          priority: 'high',
          status: 'completed',
          dueDate: '2024-10-31',
          progress: 100
        }
      ]
    }
  ]);

  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>('1');
  const [showAddAction, setShowAddAction] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    category: 'skill' as const,
    priority: 'medium' as const,
    dueDate: ''
  });

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

  const handleAddAction = () => {
    if (newAction.title.trim() && selectedCollaborator) {
      const action: PDIAction = {
        id: Date.now().toString(),
        title: newAction.title,
        description: newAction.description,
        category: newAction.category,
        priority: newAction.priority,
        status: 'planned',
        dueDate: newAction.dueDate,
        progress: 0
      };

      setCollaborators(collaborators.map(collab => 
        collab.id === selectedCollaborator
          ? { ...collab, actions: [...collab.actions, action] }
          : collab
      ));

      setNewAction({
        title: '',
        description: '',
        category: 'skill',
        priority: 'medium',
        dueDate: ''
      });
      setShowAddAction(false);
    }
  };

  const handleUpdateActionProgress = (collaboratorId: string, actionId: string, progress: number) => {
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
  };

  const handleDeleteAction = (collaboratorId: string, actionId: string) => {
    setCollaborators(collaborators.map(collab => 
      collab.id === collaboratorId
        ? { ...collab, actions: collab.actions.filter(action => action.id !== actionId) }
        : collab
    ));
  };

  const selectedCollaboratorData = collaborators.find(c => c.id === selectedCollaborator);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        {selectedCollaborator && (
          <button
            onClick={() => setShowAddAction(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Ação
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de Colaboradores */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Colaboradores</h2>
          <div className="space-y-2">
            {collaborators.map((collab) => (
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
            ))}
          </div>
        </div>

        {/* Detalhes do Colaborador */}
        <div className="lg:col-span-3">
          {selectedCollaboratorData ? (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg">
                    {selectedCollaboratorData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedCollaboratorData.name}</h2>
                    <p className="text-gray-600">{selectedCollaboratorData.position} • {selectedCollaboratorData.department}</p>
                  </div>
                </div>

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
                  {selectedCollaboratorData.actions.map((action) => (
                    <div key={action.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(action.category)}
                            <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{action.description}</p>
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
                    </div>
                  ))}
                </div>

                {selectedCollaboratorData.actions.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlusIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ação de desenvolvimento</h3>
                    <p className="text-gray-500 mb-4">
                      Comece criando ações de desenvolvimento para {selectedCollaboratorData.name}.
                    </p>
                    <button
                      onClick={() => setShowAddAction(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Criar primeira ação
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um colaborador</h3>
              <p className="text-gray-500">
                Escolha um colaborador da lista para visualizar e gerenciar seu PDI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDI; 