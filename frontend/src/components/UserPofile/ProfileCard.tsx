import React from "react";
import { useAuth } from "../../context/AuthContext";

interface ProfileCardProps {
  name: string;
  role: string;
  unity: string;
  email: string;
  accounts: string[];
  onSwitchAccount: (account: string) => void;
  currentAccount: string;
  userId: number;
  photo?: string | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  unity,
  email,
  accounts,
  onSwitchAccount,
  currentAccount,
  userId,
  photo,
}) => {
  const { user, setUser } = useAuth();
  const [avatar, setAvatar] = React.useState<string | null>(photo || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setAvatar(photo || null);
  }, [photo]);

  // Função para pegar as iniciais do nome
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  }

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        setAvatar(base64);
        // Envia para o backend
        try {
          await fetch(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:3000"
            }/users/${userId}/photo`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ photo: base64 }),
            }
          );
          // Atualiza o contexto do usuário para refletir a nova foto imediatamente
          if (user) {
            setUser({ ...user, photo: base64 });
            localStorage.setItem("user", JSON.stringify({ ...user, photo: base64 }));
          }
        } catch (err) {
          alert("Erro ao salvar foto");
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Mapeamento de roles para português
  const roleMap: Record<string, string> = {
    ADMIN: "Administrador",
    MANAGER: "Gestor",
    COLLABORATOR: "Colaborador",
    MENTOR: "Mentor",
    COMMITTEE: "Comitê",
    HR: "RH",
  };

  // Se o usuário for admin, mostra todos os cargos possíveis
  const isAdmin = accounts.includes("ADMIN");
  const allRoles = Object.keys(roleMap);
  const selectAccounts = isAdmin ? allRoles : accounts;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-9 mt-12 flex flex-col items-center relative">
      {/* Avatar com iniciais ou imagem */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-[#08605F] shadow-lg flex items-center justify-center border-4 border-white overflow-hidden group cursor-pointer"
        onClick={handlePhotoClick}
        style={{ position: 'absolute', top: '-3rem', left: '50%', transform: 'translateX(-50%)' }}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePhotoClick(); }}
        onMouseLeave={e => e.currentTarget.blur()}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-5xl font-extrabold select-none leading-none">
            {getInitials(name)}
          </span>
        )}
        {/* Ícone de lápis sobreposto ao passar o mouse */}
        <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z"
            />
          </svg>
        </span>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="mt-16 w-full flex flex-col items-center">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1 tracking-tight">
          {name}
        </h2>
        {/* Exibe apenas o cargo/role atual selecionado */}
        <p className="text-[#08605F] font-semibold text-lg mb-2">
          {roleMap[role] || role}
        </p>
        <div className="flex flex-col md:flex-row gap-5 w-full justify-center mt-3 mb-5">
          <div className="flex flex-col flex-1 items-center bg-[#E6F4F4] rounded-xl px-6 py-3 shadow">
            <span className="text-gray-500 text-xs">Unidade</span>
            <span className="text-[#08605F] font-medium text-base">
              {unity || "-"}
            </span>
          </div>
          <div className="flex flex-col flex-1 items-center bg-[#E6F4F4] rounded-xl px-6 py-3 shadow">
            <span className="text-gray-500 text-xs">E-mail</span>
            <span className="text-[#08605F] font-medium text-base">
              {email}
            </span>
          </div>
        </div>
        {selectAccounts.length > 1 && (
          <div className="mb-5 w-full flex flex-col items-center">
            <label className="block text-gray-600 text-xs mb-1">
              Trocar de conta:
            </label>
            <select
              className="border border-[#08605F] rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#08605F] bg-white text-[#08605F] font-semibold text-base"
              value={currentAccount}
              onChange={(e) => onSwitchAccount(e.target.value)}
            >
              {selectAccounts.map((acc) => (
                <option key={acc} value={acc}>
                  {roleMap[acc] || acc}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
