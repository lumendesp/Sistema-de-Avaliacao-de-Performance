import React from 'react';
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import type { PDIProps } from './types';
import { usePDI } from './usePDI';
import CollaboratorHeader from './CollaboratorHeader';
import ActionForm from './ActionForm';
import ActionCard from './ActionCard';
import CollaboratorList from './CollaboratorList';

const PDI: React.FC<PDIProps> = ({ 
  userRole = 'manager',
  title = 'PDI - Plano de Desenvolvimento Individual',
  description = 'Acompanhe o desenvolvimento dos seus colaboradores'
}) => {
  const {
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
  } = usePDI(userRole);

  const selectedCollaboratorData = collaborators.find(c => c.id === selectedCollaborator);

  // Funções para edição de ação
  const handleEditActionClick = (collaboratorId: string, action: any) => {
    setEditingActionId(action.id);
    setEditActionData({ ...action, collaboratorId });
  };

  const handleEditActionChange = (field: keyof any, value: any) => {
    if (!editActionData) return;
    setEditActionData({ ...editActionData, [field]: value });
  };

  const handleEditGoalChange = (goalId: string, value: string) => {
    if (!editActionData) return;
    setEditActionData({
      ...editActionData,
      goals: editActionData.goals?.map(g => g.id === goalId ? { ...g, descricao: value } : g) || [],
    });
  };

  const handleEditAddGoal = () => {
    if (!editActionData) return;
    setEditActionData({
      ...editActionData,
      goals: [
        ...(editActionData.goals || []),
        { id: Date.now().toString(), descricao: '', concluida: false },
      ],
    });
  };

  const handleEditRemoveGoal = (goalId: string) => {
    if (!editActionData) return;
    setEditActionData({
      ...editActionData,
      goals: (editActionData.goals || []).filter(g => g.id !== goalId),
    });
  };

  const handleEditActionSave = () => {
    if (!editActionData) return;
    // Validação simples
    const errors: {[key: string]: string} = {};
    if (!editActionData.title.trim()) errors.title = 'Título obrigatório';
    if (!editActionData.dueDate) errors.dueDate = 'Data obrigatória';
    if (!editActionData.category) errors.category = 'Categoria obrigatória';
    if (!editActionData.priority) errors.priority = 'Prioridade obrigatória';
    if (!editActionData.goals?.length || editActionData.goals.some(g => !g.descricao.trim())) errors.goals = 'Preencha todas as metas';
    setActionErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    // Calcular progresso baseado nas metas
    let progress = 0;
    if (editActionData.goals && editActionData.goals.length > 0) {
      const total = editActionData.goals.length;
      const done = editActionData.goals.filter(g => g.concluida).length;
      progress = Math.round((done / total) * 100);
    }
    
    // Aqui você precisaria implementar a função updatePdiAction
    // updatePdiAction(Number(editActionData.id), {
    //   title: editActionData.title,
    //   description: editActionData.description,
    //   category: editActionData.category,
    //   priority: editActionData.priority,
    //   dueDate: editActionData.dueDate,
    //   goals: editActionData.goals,
    //   progress,
    // }).then(() => {
    //   // Atualiza localmente
    //   setCollaborators(collaborators.map(collab =>
    //     collab.id === editActionData.collaboratorId
    //       ? {
    //           ...collab,
    //           actions: collab.actions.map(a =>
    //             a.id === editActionData.id
    //               ? { ...editActionData, progress }
    //               : a
    //         )
    //       }
    //     : collab
    //   ));
    //   setEditingActionId(null);
    //   setEditActionData(null);
    //   setActionErrors({});
    // });
  };

  const handleEditActionCancel = () => {
    setEditingActionId(null);
    setEditActionData(null);
    setActionErrors({});
  };

  return (
    <div className="w-full flex flex-col gap-4 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{description}</p>
        </div>

        {/* Bloco de seleção de planos e '+ Novo Plano' no topo */}
        {userRole === 'collaborator' && userPdis.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-semibold text-gray-700">Plano:</span>
              <span className="font-bold text-base sm:text-lg">
                {selectedPdiId && userPdis.find(pdi => pdi.id.toString() === selectedPdiId)?.title}
              </span>
              <div className="relative inline-block sm:ml-2">
                <button
                  className="text-sm text-green-700 border border-green-600 rounded px-2 py-1 hover:bg-green-50 transition-colors"
                  onClick={() => setShowPdiDropdown(!showPdiDropdown)}
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
              className="text-sm text-green-700 border border-dashed border-green-600 rounded px-2 py-1 hover:bg-green-50 transition-colors self-start sm:self-auto"
              onClick={() => setShowCreatePdi(true)}
              type="button"
            >
              + Novo Plano
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Lista de colaboradores para manager */}
          {userRole !== 'collaborator' && (
            <CollaboratorList
              collaborators={collaborators}
              selectedCollaborator={selectedCollaborator}
              onSelectCollaborator={setSelectedCollaborator}
              filter={managerCollaboratorFilter}
              onFilterChange={setManagerCollaboratorFilter}
            />
          )}

          {/* Detalhes do Colaborador ou do próprio usuário */}
          <div className="w-full">
            {userRole === 'collaborator' && collaborators.length === 0 && !showCreatePdi && (
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Você ainda não possui um PDI cadastrado</h3>
                <p className="text-sm text-gray-500 mb-4">Crie seu plano de desenvolvimento individual para começar a adicionar ações.</p>
                <button
                  onClick={() => setShowCreatePdi(true)}
                  className="bg-[#08605F] hover:bg-[#064a49] text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Criar meu PDI
                </button>
              </div>
            )}

            {userRole === 'collaborator' && showCreatePdi ? (
              <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
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
                  className="bg-[#08605F] hover:bg-[#064a49] text-white px-4 py-2 rounded-lg transition-colors w-full"
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
                  {/* Botão de novo PDI sempre visível para gestor */}
                  {userRole === 'manager' && selectedCollaboratorData && (
                    <div className="flex justify-end mb-4">
                      <button
                        className="text-sm text-green-700 border border-dashed border-green-600 rounded px-2 py-1 hover:bg-green-50 transition-colors"
                        onClick={() => setShowCreatePdiForCollaborator(true)}
                        type="button"
                      >
                        + Novo Plano
                      </button>
                    </div>
                  )}

                  {/* Formulário de novo PDI para gestor */}
                  {userRole === 'manager' && showCreatePdiForCollaborator && selectedCollaboratorData && (
                    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Novo PDI para {selectedCollaboratorData.name}</h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                        <input
                          type="text"
                          value={newPdiForCollaborator.title}
                          onChange={e => setNewPdiForCollaborator({ ...newPdiForCollaborator, title: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Plano 2024"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                        <textarea
                          value={newPdiForCollaborator.description}
                          onChange={e => setNewPdiForCollaborator({ ...newPdiForCollaborator, description: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={3}
                          placeholder="Descreva o objetivo de desenvolvimento..."
                        />
                      </div>
                      <button
                        onClick={handleCreatePdiForCollaborator}
                        className="bg-[#08605F] hover:bg-[#064a49] text-white px-4 py-2 rounded-lg transition-colors w-full"
                      >
                        Salvar PDI
                      </button>
                      <button
                        onClick={() => setShowCreatePdiForCollaborator(false)}
                        className="mt-2 w-full text-gray-500 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  {/* Mensagem para gestor se colaborador não tem PDI */}
                  {userRole === 'manager' && !selectedCollaboratorData.pdiId && !showCreatePdiForCollaborator && (
                    <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                      Este colaborador ainda não possui um PDI cadastrado.
                    </div>
                  )}

                  {selectedCollaboratorData.pdiId && (
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 w-full max-w-full">
                      {/* Cabeçalho do colaborador */}
                      <CollaboratorHeader
                        collaborator={selectedCollaboratorData}
                        userRole={userRole}
                        selectedCollaboratorPdis={selectedCollaboratorPdis}
                        selectedCollaboratorPdiId={selectedCollaboratorPdiId}
                        showPdiDropdown={showPdiDropdown}
                        setShowPdiDropdown={setShowPdiDropdown}
                        setSelectedCollaboratorPdiId={setSelectedCollaboratorPdiId}
                        onNewAction={() => setShowAddAction(true)}
                        onNewPdi={() => setShowCreatePdiForCollaborator(true)}
                      />

                      {/* Formulário de nova ação */}
                      {showAddAction && (
                        <ActionForm
                          actionData={newAction}
                          setActionData={setNewAction}
                          errors={actionErrors}
                          onSave={handleAddAction}
                          onCancel={() => setShowAddAction(false)}
                          title="Nova Ação de Desenvolvimento"
                        />
                      )}

                      {/* Lista de Ações */}
                      <div className="space-y-4">
                        {selectedCollaboratorData.actions.length > 0 ? (
                          <div className="flex flex-col gap-8 items-center w-full">
                            {selectedCollaboratorData.actions.map((action) => (
                              <ActionCard
                                key={action.id}
                                action={action}
                                collaboratorId={selectedCollaboratorData.id}
                                onEdit={handleEditActionClick}
                                onDelete={handleDeleteAction}
                                onToggleGoal={handleToggleGoal}
                                onUpdateProgress={(progress) => handleUpdateActionProgress(selectedCollaboratorData.id, action.id, progress)}
                                isEditing={editingActionId === action.id}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <PlusIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nenhuma ação de desenvolvimento</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Comece criando ações de desenvolvimento
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                              ) : (
                userRole === 'manager' && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Selecione um colaborador</h3>
                    <p className="text-sm text-gray-500">
                      Busque um de seus colaboradores para visualizar e gerenciar seu PDI.
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDI; 