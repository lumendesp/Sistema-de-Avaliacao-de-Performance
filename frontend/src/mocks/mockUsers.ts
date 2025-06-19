import type { UserAuthPassword } from "../types/userAuth";

export const mockUsers: UserAuthPassword[] = [
  {
    id: 1,
    name: "Carlos Nogueira",
    email: "carlos@rocketcorp.com",
    password: "colaborador123",
    roles: ["COLLABORATOR"],
  },
  {
    id: 2,
    name: "Ana Souza",
    email: "ana@rocketcorp.com",
    password: "gestor123",
    roles: ["MANAGER", "COLLABORATOR"],
  },
  {
    id: 3,
    name: "Maria Luísa",
    email: "maria@rocketcorp.com",
    password: "admin123",
    roles: ["ADMIN"],
  },
  {
    id: 4,
    name: "Bruno Castro",
    email: "bruno@rocketcorp.com",
    password: "rh123",
    roles: ["HR", "COLLABORATOR"],
  },
  {
    id: 5,
    name: "Luciana Torres",
    email: "luciana@rocketcorp.com",
    password: "comite123",
    roles: ["COMMITTEE", "COLLABORATOR"],
  }
];
