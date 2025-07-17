import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Para deslogar automaticamente ao acessar /login
  useEffect(() => {
    logout();
  }, []);

  // Sempre redireciona para colaborador após login
  const getHighestRoleRoute = () => "/collaborator";

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      // user pode não estar atualizado imediatamente, então pega do localStorage
      const storedUser = localStorage.getItem("user");
      let roles: string[] = [];
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          roles = Array.isArray(parsed.roles)
            ? parsed.roles.map((r: any) => (typeof r === "string" ? r : r.role))
            : [];
        } catch {}
      }
      navigate(getHighestRoleRoute());
    } else setError("Credenciais Inválidas");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="bg-[#08605F1F] h-screen w-full flex items-center justify-center select-none px-4">
      <div className="bg-white flex flex-col md:flex-row w-full max-w-4xl rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-white flex flex-col justify-center gap-6 w-full md:w-1/2 rounded-t-3xl md:rounded-tl-3xl md:rounded-bl-3xl py-16 px-8 md:py-20 md:px-12">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold text-[#1D1D1D]">
                Faça o seu login
              </p>
              <div className="bg-[#08605F] h-1 w-40 md:w-64 rounded-2xl"></div>
            </div>
            <p className="text-sm text-gray-500">
              Acesse seu painel de desempenho
            </p>
          </div>
          <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@email.com"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="w-full border-none rounded-md p-3 text-sm focus:outline-none bg-gray-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-sm text-gray-700 block mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full border-none rounded-md p-3 text-sm focus:outline-none bg-gray-100"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-5">
            <p className="text-sm text-gray-500 mt-4">Esqueceu sua senha?</p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full py-2 bg-[#08605F] text-white font-semibold text-base rounded-md hover:bg-[#05504e] transition-all duration-200"
            >
              Entrar
            </button>
          </div>
        </div>

        <div className="hidden md:flex w-full md:w-1/2 bg-[#08605F] text-white flex flex-col justify-center items-center text-center py-16 px-8 md:py-20 md:px-12 rounded-b-3xl md:rounded-r-3xl md:rounded-l-[100px] gap-8">
          <p className="text-2xl font-bold mb-2">Bem-vindo ao RPE</p>
          <p className="text-sm text-white/80 px-2 md:px-0">
            A plataforma Rocket Performance & Engagement ajuda você a avaliar,
            desenvolver e reconhecer os pontos fortes de cada colaborador da sua
            equipe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
