export function translateRole(role: string): string {
  switch (role) {
    case 'COLLABORATOR':
      return 'Colaborador';
    case 'MANAGER':
      return 'Gestor';
    case 'MENTOR':
      return 'Mentor';
    case 'HR':
      return 'RH';
    case 'COMMITTEE':
      return 'Comitê';
    case 'ADMIN':
      return 'Administrador';
    default:
      return role;
  }
} 