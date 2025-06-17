import { type Collaborator } from '../types/evaluations';

export const mockCollaborators: Collaborator[] = [
    { id: 1, name: 'Ana Silva', role: 'Designer de Produto', avatarInitials: 'AS', unit: 'Tecnologia', status: 'finalizado' },
    { id: 2, name: 'Bruno Costa', role: 'Desenvolvedor Frontend', avatarInitials: 'BC', unit: 'Tecnologia', status: 'pendente' },
    { id: 3, name: 'Carla Dias', role: 'Desenvolvedor Backend', avatarInitials: 'CD', unit: 'Tecnologia', status: 'finalizado' },
    { id: 4, name: 'Daniel Souza', role: 'Analista de Marketing', avatarInitials: 'DS', unit: 'Marketing', status: 'pendente' },
    { id: 5, name: 'Eduarda Lima', role: 'Gerente de Vendas', avatarInitials: 'EL', unit: 'Vendas', status: 'pendente' },
    { id: 6, name: 'Fábio Mendes', role: 'Analista de RH', avatarInitials: 'FM', unit: 'RH', status: 'finalizado' },
    { id: 7, name: 'Gabriela Andrade', role: 'Designer UX', avatarInitials: 'GA', unit: 'Tecnologia', status: 'pendente' },
];