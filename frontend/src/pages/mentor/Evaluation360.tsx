import { useEffect, useState } from "react";
import CollaboratorsSearchBar from "../../components/CollaboratorsSearchBar";
import PeerEvaluationReadOnlyForm from "../../components/PeerEvaluationForm/PeerEvaluationReadOnlyForm";
import { fetchMentorMentees, fetchPeerEvaluations } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { Collaborator } from "../../types/collaboratorStatus";

interface PeerProject {
  project?: { name: string };
  period?: number;
}

interface PeerEvaluation {
  evaluator?: { name: string; email: string };
  score: number;
  strengths: string;
  improvements: string;
  motivation: string;
  projects?: PeerProject[];
}

const PeerEvaluationMentor = () => {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Collaborator[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<Collaborator | null>(
    null
  );
  const [peerEvaluations, setPeerEvaluations] = useState<PeerEvaluation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetchMentorMentees(user.id)
      .then(setMentees)
      .catch(() => setMentees([]));
  }, [user]);

  useEffect(() => {
    if (!selectedMentee) return;
    setLoading(true);
    fetchPeerEvaluations(selectedMentee.id)
      .then(setPeerEvaluations)
      .catch(() => setPeerEvaluations([]))
      .finally(() => setLoading(false));
  }, [selectedMentee]);

  return (
    <div className="bg-[#f1f1f1] h-screen w-full flex flex-col gap-4 p-3">
      <CollaboratorsSearchBar />
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Selecione um mentorado:
        </label>
        <select
          className="p-2 rounded border"
          value={selectedMentee?.id || ""}
          onChange={(e) => {
            const mentee = mentees.find((m) => m.id === Number(e.target.value));
            setSelectedMentee(mentee || null);
          }}
        >
          <option value="">-- Escolha --</option>
          {mentees.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      {loading && <div>Carregando avaliações 360...</div>}
      {!loading && selectedMentee && peerEvaluations.length === 0 && (
        <div>Nenhuma avaliação 360 encontrada para este colaborador.</div>
      )}
      {!loading &&
        peerEvaluations.map((evaluation, idx) => (
          <PeerEvaluationReadOnlyForm
            key={idx}
            collaboratorName={evaluation.evaluator?.name || ""}
            collaboratorEmail={evaluation.evaluator?.email || ""}
            initials={
              evaluation.evaluator?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || ""
            }
            score={evaluation.score}
            strengths={evaluation.strengths}
            improvements={evaluation.improvements}
            motivationLabel={evaluation.motivation}
            projects={evaluation.projects?.map((p) => ({
              name: p.project?.name || "",
              period: p.period ?? 0,
            }))}
          />
        ))}
    </div>
  );
};

export default PeerEvaluationMentor;
