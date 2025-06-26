import CollaboratorsSearchBar from "../../components/CollaboratorsSearchBar";
import PeerEvaluationReadOnlyForm from "../../components/PeerEvaluationForm/PeerEvaluationReadOnlyForm";

import { fetchCollaboratorsBySearch } from "../../services/api";
import { useEffect, useState } from "react";

const fakePeerEvaluations = [
  {
    collaboratorName: "Carlos Nunes",
    role: "Product Design",
    score: 4,
    strengths:
      "Carlos sempre entrega suas tarefas no prazo e colabora muito bem com o time.",
    improvements:
      "Poderia participar mais das reuniões semanais e compartilhar mais ideias.",
    initials: "CN",
  },
  {
    collaboratorName: "Ana Souza",
    role: "Frontend Developer",
    score: 5,
    strengths:
      "Ana tem excelente conhecimento técnico e ajuda os colegas sempre que possível.",
    improvements:
      "Pode melhorar a comunicação em projetos multidisciplinares.",
    initials: "AS",
  },
  {
    collaboratorName: "Bruno Lima",
    role: "Backend Developer",
    score: 3,
    strengths: "Bruno é dedicado e aprende rápido.",
    improvements:
      "Precisa revisar melhor o código antes de enviar para evitar bugs simples.",
    initials: "BL",
  },
];

const PeerEvaluationManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCollaboratorsBySearch(searchTerm)
        // .then((data) => setCollaborators(data))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="bg-[#f1f1f1] h-screen w-full flex flex-col gap-4 p-3">
      <CollaboratorsSearchBar onSearch={setSearchTerm}/>
      {fakePeerEvaluations.map((evaluation, idx) => (
        <PeerEvaluationReadOnlyForm key={idx} {...evaluation} />
      ))}
    </div>
  );
};

export default PeerEvaluationManager;
