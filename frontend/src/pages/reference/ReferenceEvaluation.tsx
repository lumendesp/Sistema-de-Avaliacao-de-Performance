import CollaboratorsSearchBar from "../../components/CollaboratorsSearchBar";
import ReferenceEvaluationForm from "../../components/ReferenceEvaluationForm/ReferenceEvaluationForm";

const ReferenceEvaluation = () => {
  return (
    <div className="bg-[#f1f1f1] h-screen w-full flex flex-col gap-4 p-3">
      <CollaboratorsSearchBar />
      <ReferenceEvaluationForm />
    </div>
  );
};

export default ReferenceEvaluation;
