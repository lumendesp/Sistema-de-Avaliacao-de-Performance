import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import PeerEvaluationForm from "../../../components/PeerEvaluationForm/PeerEvaluationForm";

const PeerEvaluation = () => {
  return (
    <div className="bg-[#f1f1f1] h-screen w-full flex flex-col gap-4 p-3">
      <CollaboratorsSearchBar />
      <PeerEvaluationForm />
    </div>
  );
};

export default PeerEvaluation;
