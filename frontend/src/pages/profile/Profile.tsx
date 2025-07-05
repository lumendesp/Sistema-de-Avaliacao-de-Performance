import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../../components/UserPofile/ProfileCard";
import { getUserById } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types/userAuth";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  unit?: { name: string } | null;
  roles: { role: Role }[];
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }
    getUserById(user.id)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar perfil");
        setLoading(false);
      });
  }, [user]);

  function getInitialAccount() {
    if (!profile) return "";
    const lastAccount = sessionStorage.getItem("lastProfileAccount");
    const roleNames = profile.roles.map((r) => r.role);
    const isAdmin = roleNames.includes("ADMIN");
    const allRoles = [
      "ADMIN",
      "MANAGER",
      "COLLABORATOR",
      "MENTOR",
      "RH",
      "COMMITTEE",
      "HR",
    ];
    if (
      lastAccount &&
      (isAdmin
        ? allRoles.includes(lastAccount)
        : roleNames.includes(lastAccount as Role))
    ) {
      return lastAccount;
    }
    const previousPath =
      window.history.state?.usr?.pathname || document.referrer;
    if (previousPath.includes("manager"))
      return (
        profile.roles.find((a) => a.role.toLowerCase().includes("gestor"))
          ?.role || roleNames[0]
      );
    if (previousPath.includes("collaborator"))
      return (
        profile.roles.find((a) => a.role.toLowerCase().includes("colaborador"))
          ?.role || roleNames[0]
      );
    if (previousPath.includes("rh"))
      return (
        profile.roles.find((a) => a.role.toLowerCase().includes("hr"))?.role ||
        roleNames[0]
      );
    if (previousPath.includes("committee"))
      return (
        profile.roles.find((a) => a.role.toLowerCase().includes("committee"))
          ?.role || roleNames[0]
      );
    return roleNames[0];
  }

  const [currentAccount, setCurrentAccount] = useState("");
  useEffect(() => {
    if (profile) {
      setCurrentAccount(getInitialAccount());
    }
    // eslint-disable-next-line
  }, [profile]);

  const handleSwitchAccount = (account: string) => {
    setCurrentAccount(account);
    sessionStorage.setItem("lastProfileAccount", account);
  };

  function getAccountRoute(account: string) {
    const acc = account?.toLowerCase?.() || "";
    if (acc.includes("manager") || acc.includes("gestor")) return "/manager";
    if (acc.includes("mentor")) return "/mentor";
    if (acc.includes("hr")) return "/rh";
    if (acc.includes("committee")) return "/committee";
    if (acc.includes("colaborador") || acc.includes("collaborator"))
      return "/collaborator";
    // fallback: volta para dashboard do colaborador se não identificar
    return "/collaborator";
  }

  function handleBack() {
    navigate(getAccountRoute(currentAccount));
  }

  if (loading)
    return <div className="text-center mt-10">Carregando perfil...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!profile || !profile.roles)
    return (
      <div className="text-center mt-10 text-red-600">
        Perfil não encontrado ou sem dados.
      </div>
    );

  // Extrai cargos (roles) como string
  const roles = profile.roles.map((r) => r.role);

  // Mapeamento de roles para português
  const roleMap: Record<string, string> = {
    ADMIN: "Administrador",
    MANAGER: "Gestor",
    COLLABORATOR: "Colaborador",
    MENTOR: "Mentor",
    RH: "RH",
    COMMITTEE: "Comitê",
    HR: "RH",
    // Adicione outros papéis conforme necessário
  };

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
        name={profile.name}
        unity={profile.unit?.name || "-"}
        email={profile.email}
        accounts={roles}
        onSwitchAccount={handleSwitchAccount}
        currentAccount={currentAccount}
        role={roleMap[currentAccount] || currentAccount}
      />
    </div>
  );
};

export default Profile;
