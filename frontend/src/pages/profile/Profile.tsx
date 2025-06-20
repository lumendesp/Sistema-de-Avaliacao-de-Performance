import React, { useState } from "react";
import ProfileCard from "../../components/ProfileCard";

const userData = {
  name: "Colaborador 1",
  role: "Gestor de Projetos",
  department: "Tecnologia da Informação",
  email: "colaborador1@rocketcorp.com",
  accounts: ["Gestor", "Colaborador"],
};

const Profile: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState(userData.accounts[0]);

  const handleSwitchAccount = (account: string) => {
    setCurrentAccount(account);
    // Aqui você pode adicionar lógica para atualizar o contexto do usuário
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white py-10 relative">
      <button
        className="absolute top-8 left-8 flex items-center gap-2 text-[#08605F] hover:underline font-semibold text-lg z-20"
        onClick={() => window.history.back()}
        aria-label="Voltar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Voltar
      </button>
      <ProfileCard
        name={userData.name}
        role={currentAccount}
        department={userData.department}
        email={userData.email}
        accounts={userData.accounts}
        onSwitchAccount={handleSwitchAccount}
        currentAccount={currentAccount}
      />
    </div>
  );
};

export default Profile;
