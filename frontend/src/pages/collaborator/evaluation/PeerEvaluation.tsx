import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import PeerEvaluationForm from "../../../components/PeerEvaluationForm/PeerEvaluationForm";

import { fetchCollaboratorsBySearch } from "../../../services/api";
import { useEffect, useState } from "react";

interface Collaborator {
  id: number;
  name: string;
  email: string;
  photo?: string;
}

const PeerEvaluation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setCollaborators([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchCollaboratorsBySearch(searchTerm)
        .then((data) => setCollaborators(data))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="bg-[#f1f1f1] h-screen w-full flex flex-col gap-4 p-3">
      <CollaboratorsSearchBar onSearch={setSearchTerm} />

      {/* Lista de colaboradores aparecendo aqui */}
      {collaborators.length > 0 && (
        <ul className="bg-white rounded-md shadow max-h-60 overflow-auto">
          {collaborators.map(collab => (
            <li
              key={collab.id}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              // aqui você pode adicionar onClick para selecionar, se quiser
            >
              {collab.name} - {collab.email}
            </li>
          ))}
        </ul>
      )}

      <PeerEvaluationForm />
    </div>
  );
};

export default PeerEvaluation;
