import { IoIosSearch } from "react-icons/io";
import { UserIcon } from "./UserIcon";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchCollaboratorsBySearch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Collaborator } from "../types/reference";

interface CollaboratorsSearchBarProps {
  onSelect?: (collaborator: Collaborator) => void; // função a ser chamada quando um colaborador é clicado
  excludeIds?: number[]; // ids dos colaboradores a serem excluídos da busca
}

const CollaboratorsSearchBar = ({
  onSelect,
  excludeIds = [],
}: CollaboratorsSearchBarProps) => {
  const [search, setSearch] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]); // lista de colaboradores
  const { user } = useAuth();
  const location = useLocation(); // para detectar mudanças de rota

  // Reset do estado quando a rota mudar
  useEffect(() => {
    setSearch("");
    setCollaborators([]);
  }, [location.pathname]);

  useEffect(() => {
    if (!search.trim()) {
      setCollaborators([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetchCollaboratorsBySearch(search)
        .then(setCollaborators)
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  // função auxiliar para obter as iniciais do nome
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="w-full relative">
      {/* barra de busca */}
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white">
        <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
        <input
          type="text"
          placeholder={placeholder || 'Buscar por colaboradores'}
          className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* lista de colaboradores (dropdown) */}
      {search.trim() !== "" && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-md px-2 py-3 flex flex-col gap-2 z-10 max-h-60 overflow-auto">
          {collaborators
            .filter((c) => !user || c.id !== user.id) // filtra colaboradores que não são o usuário logado e que não estão na lista de ids a serem excluídos
            .filter((c) => !excludeIds.includes(c.id)).length > 0 ? (
            collaborators
              .filter((c) => !user || c.id !== user.id)
              .filter((c) => !excludeIds.includes(c.id))
              .map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-[#F1F5F9] cursor-pointer"
                  // quando um colaborador é clicado, a função onSelect é chamada e a barra de busca é limpa
                  onClick={() => {
                    if (onSelect) onSelect(collab);
                    setSearch("");
                  }}
                >
                  <UserIcon initials={getInitials(collab.name)} size={40} />
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-[#1D1D1D]">
                      {collab.name}
                    </p>
                    <p className="text-xs font-normal text-[#1D1D1D]/75">
                      {collab.email}
                    </p>
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