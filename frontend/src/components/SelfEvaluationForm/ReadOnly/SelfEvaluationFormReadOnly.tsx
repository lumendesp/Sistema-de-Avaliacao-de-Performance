import SelfEvaluationItemReadOnly from "./SelfEvaluationItemReadOnly";
import type { SelfEvaluationFormProps } from "../../../types/selfEvaluation";
import ScoreBox from "../../ScoreBox";

const SelfEvaluationFormReadOnly = ({
  title,
  criteria,
  averageScore,
}: Pick<SelfEvaluationFormProps, "title" | "criteria"> & {
  averageScore?: number;
}) => {
  const totalCount = criteria.length;
  const answeredCount = criteria.filter((c) => c.score && c.justification?.trim()).length;

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full mb-6">
      <div className="flex justify-between items-center mb-4 pb-3">
        <h3 className="text-bg font-semibold text-green-main">{title}</h3>
        <div className="flex items-center gap-4">
          <ScoreBox score={averageScore ?? 0} />
          <span className="bg-green-confirm bg-opacity-25 text-green-secondary font-bold text-sm px-3 py-1 rounded-md">
            {answeredCount}/{totalCount} preenchidos
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {criteria.map((criterion, index) => (
          <SelfEvaluationItemReadOnly
            key={criterion.id}
            index={index + 1}
            title={criterion.title}
            description={criterion.description}
            score={criterion.score ?? 0}
            justification={criterion.justification ?? ""}
          />
        ))}
      </div>
    </div>
  );
};

export default SelfEvaluationFormReadOnly;
