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
    <div className="bg-[#08605e63] flex justify-center items-center h-screen w-full">
      <div className="w-1/2 flex flex-col items-center gap-4">
        <p className="font-medium text-6xl text-[#044e4c]">Access denied!</p>
        <p className="mt-6 text-center text-2xl text-[#ffffff]">
          We're sorry, but you do not have required permissions to access this
          page. Please contact the site administrator.
        </p>
        <div className="mt-2 flex gap-2 items-center">
          <p className="text-[#044e4c]">Click to</p>
          <button
            onClick={handleLogout}
            className="bg-[#044e4c] hover:bg-[#144544] text-white px-6 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>
      </div>
      <img
        src={unauthorized}
        alt="Unauthorized Illustration"
        className="w-1/2 max-w-xl"
      />
    </div>
  );
};

export default Unauthorized;
