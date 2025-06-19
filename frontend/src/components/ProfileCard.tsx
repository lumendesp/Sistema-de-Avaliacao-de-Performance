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
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-12 mt-16 flex flex-col items-center relative">
      {/* Avatar com iniciais */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-[#08605F] shadow-lg flex items-center justify-center border-4 border-white">
        <span className="text-white text-6xl font-extrabold select-none leading-none">
          {getInitials(name)}
        </span>
      </div>
      <div className="mt-20 w-full flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">
          {name}
        </h2>
        <p className="text-[#08605F] font-semibold text-lg mb-2">{role}</p>
        <div className="flex flex-col md:flex-row gap-6 w-full justify-center mt-4 mb-6">
          <div className="flex flex-col items-center bg-[#E6F4F4] rounded-xl px-8 py-4 shadow">
            <span className="text-gray-500 text-sm">Departamento</span>
            <span className="text-[#08605F] font-medium text-lg">
              {department}
            </span>
          </div>
          <div className="flex flex-col items-center bg-[#E6F4F4] rounded-xl px-8 py-4 shadow">
            <span className="text-gray-500 text-sm">E-mail</span>
            <span className="text-[#08605F] font-medium text-lg">{email}</span>
          </div>
        </div>
        {accounts.length > 1 && (
          <div className="mb-6 w-full flex flex-col items-center">
            <label className="block text-gray-600 text-sm mb-1">
              Trocar de conta:
            </label>
            <select
              className="border border-[#08605F] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#08605F] bg-white text-[#08605F] font-semibold"
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
        <button className="mt-2 bg-[#08605F] hover:bg-[#064947] text-white font-bold px-10 py-3 rounded-full shadow-lg transition text-lg">
          Mudar Foto
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
