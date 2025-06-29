import { IoIosSearch } from "react-icons/io";
import { UserIcon } from "./UserIcon";
import { useState, useEffect } from "react";
import { fetchCollaboratorsBySearch } from "../services/api";

interface Collaborator {
  id: number;
  name: string;
  email: string;
}

const CollaboratorsSearchBar = () => {
  const [search, setSearch] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setCollaborators([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetchCollaboratorsBySearch(search).then(setCollaborators).catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white">
        <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
        <input
          type="text"
          placeholder="Buscar por colaboradores"
          className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {search.trim() !== "" && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-md px-2 py-3 flex flex-col gap-2 z-10 max-h-60 overflow-auto">
          {collaborators.length > 0 ? (
            collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-[#F1F5F9] cursor-pointer"
              >
                <UserIcon initials={getInitials(collab.name)} size={40} />
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-[#1D1D1D]">{collab.name}</p>
                  <p className="text-xs font-normal text-[#1D1D1D]/75">{collab.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#1D1D1D]/50 p-2">Nenhum colaborador encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaboratorsSearchBar;