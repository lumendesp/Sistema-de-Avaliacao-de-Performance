import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../../components/UserPofile/ProfileCard";

const userData = {
  name: "Colaborador 1",
  role: "Gestor de Projetos",
  unity: "Rio de Janeiro",
  email: "colaborador1@rocketcorp.com",
  accounts: ["Colaborador", "Gestor", "RH", "Comitê"],
};

const Profile: React.FC = () => {
  const navigate = useNavigate();

  function getInitialAccount() {
    // Tenta pegar do sessionStorage a última conta usada
    const lastAccount = sessionStorage.getItem("lastProfileAccount");
    if (lastAccount && userData.accounts.includes(lastAccount)) {
      return lastAccount;
    }
    // Detecta de onde veio (rota anterior)
    const previousPath =
      window.history.state?.usr?.pathname || document.referrer;
    if (previousPath.includes("manager"))
      return (
        userData.accounts.find((a) => a.toLowerCase().includes("gestor")) ||
        userData.accounts[0]
      );
    if (previousPath.includes("collaborator"))
      return (
        userData.accounts.find((a) =>
          a.toLowerCase().includes("colaborador")
        ) || userData.accounts[0]
      );
    if (previousPath.includes("rh"))
      return (
        userData.accounts.find((a) => a.toLowerCase().includes("rh")) ||
        userData.accounts[0]
      );
    if (previousPath.includes("committee"))
      return (
        userData.accounts.find((a) => a.toLowerCase().includes("comit")) ||
        userData.accounts[0]
      );
    return userData.accounts[0];
  }

  const [currentAccount, setCurrentAccount] = useState(getInitialAccount());

  const handleSwitchAccount = (account: string) => {
    setCurrentAccount(account);
    sessionStorage.setItem("lastProfileAccount", account);
  };

  function getAccountRoute(account: string) {
    const acc = account.toLowerCase();
    if (acc.includes("colaborador")) return "/collaborator";
    if (acc.includes("gestor")) return "/manager";
    if (acc.includes("rh")) return "/rh";
    if (acc.includes("comit")) return "/committee";
    return "/";
  }

  function handleBack() {
    navigate(getAccountRoute(currentAccount));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-white py-10 relative">
      <button
        className="absolute top-8 left-8 flex items-center gap-2 text-[#08605F] hover:underline font-semibold text-lg z-20"
        onClick={handleBack}
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
        unity={userData.unity}
        email={userData.email}
        accounts={userData.accounts}
        onSwitchAccount={handleSwitchAccount}
        currentAccount={currentAccount}
      />
    </div>
  );
};

export default Profile;
