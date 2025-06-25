import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
// import { mockUsers } from "../mocks/mockUsers";
import type { UserAuth, UserAuthPassword } from "../types/userAuth";
import { loginRequest } from "../services/api";

// Define o formato do contexto de autenticação
interface AuthContextProps {
  user: UserAuth | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Cria o contexto com o tipo definido acima
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// Esse é o componente em si, que fornece o contexto para o resto da aplicação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token") || null
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      // corrigir roles aqui, caso estejam no formato [{userId, role}]
      const userRoles = Array.isArray(parsedUser.roles)
        ? parsedUser.roles.map((r: any) => (typeof r === "string" ? r : r.role))
        : [];

      setUser({
        ...parsedUser,
        roles: userRoles,
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginRequest(email, password);

      // transforma os roles
      const userRoles = data.user?.roles?.map((r: any) => r.role) || [];

      // salva o token JWT
      localStorage.setItem("token", data.access_token);

      // remove a senha antes de salvar
      const { password: _, ...userWithoutPassword } = data.user || { email };

      // salva o usuário
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));

      setUser({
        ...userWithoutPassword,
        roles: userRoles,
      });
      setToken(data.access_token);

      return true;
    } catch {
      return false;
    }
  };

  // Limpa o useState do usuário
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Aqui é um hook personalizado para acessar o contexto de autenticação em qualquer componente, ao invés de fazer useContext(AuthContext);
export const useAuth = () => useContext(AuthContext);
