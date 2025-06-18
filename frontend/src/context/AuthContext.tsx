import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { mockUsers } from "../mocks/mockUsers";
import type { UserAuth, UserAuthPassword } from "../types/userAuth";

// Define o formato do contexto de autenticação
interface AuthContextProps {
  user: UserAuth | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

// Cria o contexto com o tipo definido acima
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// Esse é o componente em si, que fornece o contexto para o resto da aplicação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuth | null>(null);

  const login = (email: string, password: string): boolean => {
    // Procura no mockUsers um usuário que tenha o mesmo email e senha
    const found = mockUsers.find(
      (user: UserAuthPassword) => user.email === email && user.password === password
    );

    // Se encontrou, remove o campo password antes de salvar no useState
    if (found) {
      const { password: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword); // Atualiza o estado com o usuário autenticado (sem senha)
      return true;
    }
    return false;
  };

  // Limpa o useState do usuário
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Aqui é um hook personalizado para acessar o contexto de autenticação em qualquer componente, ao invés de fazer useContext(AuthContext);
export const useAuth = () => useContext(AuthContext);
