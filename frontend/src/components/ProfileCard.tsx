import React from "react";

interface ProfileCardProps {
  name: string;
  role: string;
  department: string;
  email: string;
  accounts: string[];
  onSwitchAccount: (account: string) => void;
  currentAccount: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  department,
  email,
  accounts,
  onSwitchAccount,
  currentAccount,
}) => {
  // Função utilitária para pegar as iniciais do nome
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-9 mt-12 flex flex-col items-center relative">
      {/* Avatar com iniciais */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-[#08605F] shadow-lg flex items-center justify-center border-4 border-white">
        <span className="text-white text-5xl font-extrabold select-none leading-none">
          {getInitials(name)}
        </span>
      </div>
      <div className="mt-16 w-full flex flex-col items-center">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1 tracking-tight">
          {name}
        </h2>
        <p className="text-[#08605F] font-semibold text-base mb-2">{role}</p>
        <div className="flex flex-col md:flex-row gap-5 w-full justify-center mt-3 mb-5">
          <div className="flex flex-col items-center bg-[#E6F4F4] rounded-xl px-6 py-3 shadow">
            <span className="text-gray-500 text-xs">Departamento</span>
            <span className="text-[#08605F] font-medium text-base">
              {department}
            </span>
          </div>
          <div className="flex flex-col items-center bg-[#E6F4F4] rounded-xl px-6 py-3 shadow">
            <span className="text-gray-500 text-xs">E-mail</span>
            <span className="text-[#08605F] font-medium text-base">{email}</span>
          </div>
        </div>
        {accounts.length > 1 && (
          <div className="mb-5 w-full flex flex-col items-center">
            <label className="block text-gray-600 text-xs mb-1">
              Trocar de conta:
            </label>
            <select
              className="border border-[#08605F] rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#08605F] bg-white text-[#08605F] font-semibold text-sm"
              value={currentAccount}
              onChange={(e) => onSwitchAccount(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="mt-2 bg-[#08605F] hover:bg-[#064947] text-white font-bold px-8 py-2 rounded-full shadow-lg transition text-base">
          Mudar Foto
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
