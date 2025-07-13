import unauthorized from "../../assets/unauthorized.svg";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Chama o logout
    navigate("/"); // Redireciona para a página de login
  };

  return (
    <div className="bg-[#08605e63] flex justify-center items-center min-h-screen px-4 py-8 flex-col md:flex-row w-full">
      <div className="w-full md:w-1/2 flex flex-col items-center gap-4 order-2 md:order-1">
        <p className="font-medium text-4xl md:text-6xl text-[#044e4c]">Acesso negado!</p>
        <p className="mt-6 md:max-w-[800px] w-full text-center text-lg md:text-2xl text-[#ffffff]">
          Desculpe, você não tem permissão para acessar esta página. Por favor,
          entre em contato com o administrador do sistema.
        </p>
        <div className="mt-2 flex gap-2 items-center">
          <p className="text-[#044e4c]">Clique para</p>
          <button
            onClick={handleLogout}
            className="bg-[#044e4c] hover:bg-[#144544] text-white px-6 py-2 rounded-xl"
          >
            Sair
          </button>
        </div>
      </div>
      <img
        src={unauthorized}
        alt="Unauthorized Illustration"
        className="order-1 md:order-2 w-1/2 max-w-xl"
      />
    </div>
  );
};

export default Unauthorized;
