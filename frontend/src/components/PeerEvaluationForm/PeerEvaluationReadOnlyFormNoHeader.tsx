// Componente inspirado no PeerEvaluationReadOnlyForm, mas sem o header (foto, nome, email, nota)
import StarRatingReadOnly from "../StarRatingReadOnly";

interface ProjectInfo {
  name: string;
  period: number;
}

interface PeerEvaluationReadOnlyFormNoHeaderProps {
  score: number;
  strengths: string;
  improvements: string;
  motivationLabel: string;
  projects?: ProjectInfo[];
}

const PeerEvaluationReadOnlyFormNoHeader = ({
  score,
  strengths,
  improvements,
  motivationLabel,
  projects = [],
}: PeerEvaluationReadOnlyFormNoHeaderProps) => {
  return (
    <div className="bg-white w-full flex flex-col px-6 py-9 rounded-xl opacity-80">
      <div className="flex flex-col mb-4 gap-3">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Avaliação de um colega
        </p>
        <StarRatingReadOnly score={score ?? 0} dimmed={true} />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Pontos fortes
          </p>
          <textarea
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100 text-[#1D1D1D]"
            value={strengths}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Pontos de melhoria
          </p>
          <textarea
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100 text-[#1D1D1D]"
            value={improvements}
            readOnly
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Você ficaria motivado em trabalhar novamente?
        </p>
        <input
          type="text"
          className="w-full h-9 p-2 rounded border border-gray-300 text-sm text-[#1D1D1D] bg-gray-100"
          value={motivationLabel}
          readOnly
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Projeto em que atuaram juntos
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
      </div>
    </div>
  );
};

export default PeerEvaluationReadOnlyFormNoHeader;
