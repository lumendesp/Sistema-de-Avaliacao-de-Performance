import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { PDIAction } from './types';
import { getCategoryIcon, getCategoryText, getPriorityColor, getStatusColor, getStatusText } from './utils';

interface ActionCardProps {
  action: PDIAction;
  collaboratorId: string;
  onEdit: (collaboratorId: string, action: PDIAction) => void;
  onDelete: (collaboratorId: string, actionId: string) => void;
  onToggleGoal: (collaboratorId: string, actionId: string, goalId: string, checked: boolean) => void;
  onUpdateProgress: (progress: number) => void;
  isEditing: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  collaboratorId,
  onEdit,
  onDelete,
  onToggleGoal,
  onUpdateProgress,
  isEditing,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 lg:p-12 min-h-[180px] w-full max-w-full flex flex-col justify-between shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(action.category)}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{action.title}</h3>
          </div>
          <p className="text-gray-600 text-sm sm:text-base mb-3">{action.description}</p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
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
        <div className="flex gap-2 self-start">
          <button
            onClick={() => onEdit(collaboratorId, action)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => onDelete(collaboratorId, action.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Progresso e metas */}
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
        {isEditing && (
          <div className="mt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={action.progress}
              onChange={(e) => onUpdateProgress(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>

      {action.goals && action.goals.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2 text-sm sm:text-base">Checklist</h4>
          <ul className="space-y-2">
            {action.goals.map((goal) => (
              <li key={goal.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={goal.concluida}
                  onChange={e => onToggleGoal(collaboratorId, action.id, goal.id, e.target.checked)}
                  className="mt-0.5 flex-shrink-0"
                />
                <span className={`text-sm sm:text-base ${goal.concluida ? 'line-through text-gray-400' : ''}`}>
                  {goal.descricao}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ActionCard; 