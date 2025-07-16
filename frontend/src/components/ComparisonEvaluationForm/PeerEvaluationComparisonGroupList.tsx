import { useEffect, useState } from "react";
import { fetchMyPeerEvaluations } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PeerEvaluationReadOnlyForm from "../PeerEvaluationForm/PeerEvaluationReadOnlyForm";

interface Props {
  cycleId: number;
}

const motivationLabels: Record<string, string> = {
  CONCORDO_TOTALMENTE: "Concordo Totalmente",
  CONCORDO_PARCIALMENTE: "Concordo Parcialmente",
  DISCORDO_PARCIALMENTE: "Discordo Parcialmente",
  DISCORDO_TOTALMENTE: "Discordo Totalmente",
};

const PeerEvaluationComparisonGroupList = ({ cycleId }: Props) => {
  const { token } = useAuth();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cycleId) return;

    console.log("🔍 cycleId recebido:", cycleId);
    console.log("🔐 token:", token);

    setLoading(true);

    fetchMyPeerEvaluations(cycleId)
      .then((data) => {
        console.log("📥 Avaliações recebidas:", data);
        setEvaluations(data);
      })
      .catch((err) => {
        console.error("❌ Erro ao buscar avaliações de pares:", err);
        setEvaluations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cycleId, token]);


  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full" />;
  if (!evaluations.length)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          Nenhuma avaliação de pares para este ciclo.
        </p>
      </div>
    );

  return (
    <div className="p-3 bg-[#f1f1f1] space-y-6 min-h-screen">
      {evaluations.map((evaluation) => (
        <PeerEvaluationReadOnlyForm
          key={evaluation.id}
          collaboratorName={evaluation.evaluatee?.name || ""}
          collaboratorEmail={evaluation.evaluatee?.email || ""}
          initials={
            evaluation.evaluatee?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || ""
          }
          score={evaluation.score}
          strengths={evaluation.strengths}
          improvements={evaluation.improvements}
          motivationLabel={motivationLabels[evaluation.motivation] || ""}
          projects={evaluation.projects?.map((p: any) => ({
            name: p.project?.name || "",
            period: p.period,
          }))}
        />
      ))}
    </div>
  );
};

export default PeerEvaluationComparisonGroupList;
