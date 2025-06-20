import { IoIosSearch } from "react-icons/io";
import { UserIcon } from "./UserIcon";

import { useState } from "react";

const mockCollaborators = [
  { id: 1, name: "Carlos Nogueira", role: "Product Designer", initials: "CN" },
  { id: 2, name: "Ana Souza", role: "Frontend Developer", initials: "AS" },
  { id: 3, name: "João Lima", role: "Backend Developer", initials: "JL" },
  { id: 4, name: "Mariana Alves", role: "UX Researcher", initials: "MA" },
  { id: 5, name: "Lucas Rocha", role: "Scrum Master", initials: "LR" },
];

const CollaboratorsSearchBar = () => {
  const [search, setSearch] = useState("");

  const filtered = mockCollaborators.filter((collab) =>
    collab.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 w-full relative">
      {/* Barra de busca */}
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white/50">
        <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
        <input
          type="text"
          placeholder="Buscar por colaboradores"
          className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista dos colaboradores */}
      {search.trim() !== "" && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-md px-2 py-3 flex flex-col gap-2 z-10">
          <p className="ml-2 text-sm font-semibold text-[#334155]">Resultados</p>

          {filtered.length > 0 ? (
            filtered.map((collab) => (
              <div
                key={collab.id}
                className={`flex items-center gap-3 rounded-md p-2 hover:bg-[#F1F5F9] cursor-pointer`}
              >
                <UserIcon initials={collab.initials} size={40}/>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-[#1D1D1D]">
                    {collab.name}
                  </p>
                  <p className="text-xs font-normal text-[#1D1D1D]/75">{collab.role}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#1D1D1D]/50 p-2">
              Nenhum colaborador encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaboratorsSearchBar;
