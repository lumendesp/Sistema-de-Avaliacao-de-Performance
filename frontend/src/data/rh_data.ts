import { type Collaborator } from '../types/evaluations';

export const mockCollaborators: Collaborator[] = [
    { id: 1, name: 'Ana Silva', role: 'Designer de Produto', avatarInitials: 'AS', unit: 'Tecnologia', status: 'finalizado', autoAvaliacao: 4.5, avaliacao360: 4.2, notaGestor: 4.0, notaFinal: 4.2 },
    { id: 2, name: 'Bruno Costa', role: 'Desenvolvedor Frontend', avatarInitials: 'BC', unit: 'Tecnologia', status: 'pendente', autoAvaliacao: 4.0 },
    { id: 3, name: 'Carla Dias', role: 'Desenvolvedor Backend', avatarInitials: 'CD', unit: 'Tecnologia', status: 'finalizado', autoAvaliacao: 3.8, avaliacao360: 4.0, notaGestor: 4.5, notaFinal: 4.1 },
    { id: 4, name: 'Daniel Souza', role: 'Analista de Marketing', avatarInitials: 'DS', unit: 'Marketing', status: 'pendente', autoAvaliacao: 4.2, avaliacao360: 4.5 },
    { id: 5, name: 'Eduarda Lima', role: 'Gerente de Vendas', avatarInitials: 'EL', unit: 'Vendas', status: 'pendente' },
    { id: 6, name: 'Fábio Mendes', role: 'Analista de RH', avatarInitials: 'FM', unit: 'RH', status: 'finalizado', autoAvaliacao: 5.0, avaliacao360: 4.8, notaGestor: 4.9, notaFinal: 4.9 },
    { id: 7, name: 'Gabriela Andrade', role: 'Designer UX', avatarInitials: 'GA', unit: 'Tecnologia', status: 'pendente', autoAvaliacao: 4.1, avaliacao360: 4.3 },
];