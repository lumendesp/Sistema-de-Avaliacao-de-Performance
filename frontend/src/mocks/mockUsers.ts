import type { UserAuthPassword } from "../types/userAuth";

export const mockUsers: UserAuthPassword[] = [
  {
    id: 1,
    name: "Carlos Nogueira",
    email: "carlos@empresa.com",
    password: "123456",
    roles: ["MANAGER"],
  },
  {
    id: 2,
    name: "Ana Souza",
    email: "ana@empresa.com",
    password: "123456",
    roles: ["MANAGER", "COLLABORATOR"],
  },
];
