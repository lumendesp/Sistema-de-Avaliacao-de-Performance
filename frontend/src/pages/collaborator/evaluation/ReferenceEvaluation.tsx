import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import ReferenceEvaluationForm from "../../../components/ReferenceEvaluationForm/ReferenceEvaluationForm";

import { fetchCollaboratorsBySearch } from "../../../services/api";
import { useEffect, useState } from "react";

const ReferenceEvaluation = () => {
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
      <ReferenceEvaluationForm />
    </div>
  );
};

export default ReferenceEvaluation;
