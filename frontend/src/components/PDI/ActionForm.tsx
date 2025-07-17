import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { NewActionData, PDIGoal } from './types';

interface ActionFormProps {
  actionData: NewActionData;
  setActionData: (data: NewActionData) => void;
  errors: {[key: string]: string};
  onSave: () => void;
  onCancel: () => void;
  title: string;
}

const ActionForm: React.FC<ActionFormProps> = ({
  actionData,
  setActionData,
  errors,
  onSave,
  onCancel,
  title,
}) => {
  const handleAddGoal = () => {
    setActionData({
      ...actionData,
      goals: [
        ...actionData.goals,
        { id: Date.now().toString(), descricao: '', concluida: false },
      ],
    });
  };

  const handleRemoveGoal = (goalId: string) => {
    setActionData({
      ...actionData,
      goals: actionData.goals.filter((g) => g.id !== goalId),
    });
  };

  const handleGoalChange = (goalId: string, value: string) => {
    setActionData({
      ...actionData,
      goals: actionData.goals.map((g) =>
        g.id === goalId ? { ...g, descricao: value } : g
      ),
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título da Ação <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={actionData.title}
            onChange={(e) => setActionData({...actionData, title: e.target.value})}
            className={`w-full p-3 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            placeholder="Ex: Melhorar habilidades de liderança"
          />
          {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria <span className="text-red-500">*</span>
          </label>
          <select
            value={actionData.category}
            onChange={(e) => setActionData({...actionData, category: e.target.value as any})}
            className={`w-full p-3 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          >
            <option value="skill">Habilidade</option>
            <option value="knowledge">Conhecimento</option>
            <option value="behavior">Comportamento</option>
            <option value="career">Carreira</option>
          </select>
          {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioridade <span className="text-red-500">*</span>
          </label>
          <select
            value={actionData.priority}
            onChange={(e) => setActionData({...actionData, priority: e.target.value as any})}
            className={`w-full p-3 border ${errors.priority ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          {errors.priority && <span className="text-red-500 text-xs">{errors.priority}</span>}
        </div>

        <div>
          <label htmlFor="dueDateInput" className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
            Data de Conclusão <span className="text-red-500">*</span>
          </label>
          <input
            id="dueDateInput"
            type="date"
            value={actionData.dueDate}
            onChange={(e) => setActionData({...actionData, dueDate: e.target.value})}
            className={`w-full p-3 border ${errors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer`}
          />
          {errors.dueDate && <span className="text-red-500 text-xs">{errors.dueDate}</span>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            value={actionData.description}
            onChange={(e) => setActionData({...actionData, description: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Descreva a ação de desenvolvimento..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metas<span className="text-red-500">*</span>
          </label>
          {actionData.goals.map((goal, idx) => (
            <div key={goal.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={goal.descricao}
                onChange={e => handleGoalChange(goal.id, e.target.value)}
                className={`flex-1 p-2 border ${errors.goals && !goal.descricao.trim() ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                placeholder={`Meta ${idx + 1}`}
              />
              <button type="button" onClick={() => handleRemoveGoal(goal.id)} className="text-red-500 px-2">Remover</button>
            </div>
          ))}
          {errors.goals && <span className="text-red-500 text-xs">{errors.goals}</span>}
          <button type="button" onClick={handleAddGoal} className="text-green-600 font-medium mt-2">+ Adicionar Meta</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onSave}
          className="bg-[#08605F] hover:bg-[#064a49] text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
        >
          Salvar Ação
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ActionForm; 