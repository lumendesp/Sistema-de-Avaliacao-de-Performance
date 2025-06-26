// Define o tipo Role, que são os papéis que cada usuário pode ter dentro da plataforma
export type Role = "COLLABORATOR" | "MANAGER" | "HR" | "COMMITTEE" | "MENTOR" | "ADMIN";

// Interface que representa um usuário autenticado (sem a senha), é o tipo usado no contexto da aplicação após o login
export interface UserAuth {
  id: number;
  name: string;
  email: string;
  roles: Role[]; // Uma lista de papéis pq o usuário pode ter mais de um, exemplo: gestor também é colaborador
  mentorId?: number;
}

// Interface que estende de UserAuth e adiciona a senha, é usada apenas para verificar login
export interface UserAuthPassword extends UserAuth {
  password: string;
}
