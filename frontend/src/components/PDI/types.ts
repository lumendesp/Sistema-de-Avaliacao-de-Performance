export interface PDIGoal {
  id: string;
  descricao: string;
  concluida: boolean;
}

export interface PDIAction {
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

export interface PDICollaborator {
  id: string;
  name: string;
  position: string;
  department: string;
  actions: PDIAction[];
  pdiId?: string;
}

export interface PDIProps {
  userRole?: string;
  title?: string;
  description?: string;
}

export interface NewActionData {
  title: string;
  description: string;
  category: 'skill' | 'knowledge' | 'behavior' | 'career';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  goals: PDIGoal[];
}

export interface NewPdiData {
  title: string;
  description: string;
} 