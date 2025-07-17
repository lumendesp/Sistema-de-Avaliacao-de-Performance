import { AcademicCapIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import type { PDIAction } from './types';

export const getCategoryIcon = (category: string) => {
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

export const getCategoryText = (category: string) => {
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

export const getPriorityColor = (priority: string) => {
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

export const getStatusColor = (status: string) => {
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

export const getStatusText = (status: string) => {
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

export const calculateProgress = (goals: PDIAction['goals']) => {
  if (!goals || goals.length === 0) return 0;
  const total = goals.length;
  const done = goals.filter(g => g.concluida).length;
  return Math.round((done / total) * 100);
}; 