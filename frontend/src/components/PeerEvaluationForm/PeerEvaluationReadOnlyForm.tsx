import ScoreBox from "../ScoreBox";
import StarRatingReadOnly from "../StarRatingReadOnly";
import { UserIcon } from "../UserIcon";

interface ProjectInfo {
  name: string;
  period: number;
}

interface PeerEvaluationReadOnlyFormProps {
  collaboratorName: string;
  collaboratorEmail: string;
  initials: string;
  score: number;
  strengths: string;
  improvements: string;
  motivationLabel: string;
  projects?: ProjectInfo[];
}

const PeerEvaluationReadOnlyForm = ({
  collaboratorName,
  collaboratorEmail,
  initials,
  score,
  strengths,
  improvements,
  motivationLabel,
  projects = [],
}: PeerEvaluationReadOnlyFormProps) => {
  return (
    <div className="bg-white w-full flex flex-col px-6 py-9 rounded-xl">
      <div className="flex justify-between items-center mb-5">
        <div className="flex justify-center items-center gap-3">
          <UserIcon initials={initials} size={40} />
          <div className="flex flex-col">
            <p className="text-sm font-bold">{collaboratorName}</p>
            <p className="text-xs font-normal text-opacity-75 text-[#1D1D1D]">
              {collaboratorEmail}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <ScoreBox score={score} />
        </div>
      </div>

      <div className="flex flex-col mb-4 gap-3">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Avaliação do colaborador
        </p>
        <StarRatingReadOnly score={score ?? 0} dimmed={true} />
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Pontos fortes
          </p>
          <textarea
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100"
            value={strengths}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Pontos de melhoria
          </p>
          <textarea
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100"
            value={improvements}
            readOnly
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Projeto em que atuaram juntos (obrigatório terem atuado juntos)
          </p>
          <input
            type="text"
            className="w-full h-9 p-2 rounded border border-gray-300 text-sm text-[#1D1D1D] bg-gray-100"
            value={projects[0]?.name || ""}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Período (em meses)
          </p>
          <input
            type="text"
            className="w-full h-9 p-2 rounded border border-gray-300 text-sm text-[#1D1D1D] bg-gray-100"
            value={projects[0]?.period?.toString() || ""}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Você ficaria motivado em trabalhar novamente com este colaborador?
          </p>
          <input
            type="text"
            className="w-full h-9 p-2 rounded border border-gray-300 text-sm text-[#1D1D1D] bg-gray-100"
            value={motivationLabel}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default PeerEvaluationReadOnlyForm;
