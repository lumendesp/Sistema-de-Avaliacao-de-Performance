import { useEffect, useState } from "react";
import axios from "axios";
import SelfEvaluationForm from "./SelfEvaluationForm";
import { useAuth } from "../../context/AuthContext";
import { useEvaluation } from "../../context/EvaluationsContext";
import type { TrackWithGroups } from "../../types/selfEvaluation";

interface Props {
  trackData: TrackWithGroups;
  cycleId: number;
}

const SelfEvaluationGroupList = ({ trackData, cycleId }: Props) => {
  const { token } = useAuth();
  const { setIsComplete, setIsUpdate, registerSubmitHandler } = useEvaluation();

  const [ratings, setRatings] = useState<Record<number, number[]>>({});
  const [justifications, setJustifications] = useState<Record<number, string[]>>({});
  const [selfEvaluationId, setSelfEvaluationId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const initialRatings: Record<number, number[]> = {};
    const initialJustifications: Record<number, string[]> = {};

    trackData.CriterionGroup.forEach((group) => {
      initialRatings[group.id] = group.configuredCriteria.map(() => 0);
      initialJustifications[group.id] = group.configuredCriteria.map(() => "");
    });

    setRatings(initialRatings);
    setJustifications(initialJustifications);
  }, [trackData]);

  const total = Object.values(ratings).reduce((sum, arr) => sum + arr.length, 0);
  const filled = Object.entries(ratings).reduce((count, [groupId, arr]) => {
    return count + arr.filter((r, i) => r > 0 && justifications[Number(groupId)][i]?.trim()).length;
  }, 0);

  useEffect(() => {
    setIsComplete(filled === total);
  }, [ratings, justifications]);

  const handleRatingChange = (groupId: number, index: number, value: number) => {
    const updated = [...ratings[groupId]];
    updated[index] = value;
    setRatings({ ...ratings, [groupId]: updated });
  };

  const handleJustificationChange = (groupId: number, index: number, value: string) => {
    const updated = [...justifications[groupId]];
    updated[index] = value;
    setJustifications({ ...justifications, [groupId]: updated });
  };

  useEffect(() => {
    // Verificar se já existe avaliação para esse ciclo
    const fetch = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/self-evaluation?cycleId=${cycleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const current = response.data.find((e: any) => e.cycle.id === cycleId);
        if (current) {
          setSelfEvaluationId(current.id);
          setIsUpdate(true);
        }
      } catch (e) {
        console.error("Erro ao verificar avaliação existente:", e);
      }
    };

    fetch();
  }, [token, cycleId]);

  useEffect(() => {
    const submitSelfEvaluation = async () => {
      const items = trackData.CriterionGroup.flatMap((group) =>
        group.configuredCriteria.map((cc, i) => ({
          criterionId: cc.criterion.id,
          score: ratings[group.id]?.[i] ?? 0,
          justification: justifications[group.id]?.[i] ?? "",
        }))
      );

      const hasEmpty = items.some((item) => item.score <= 0 || item.justification.trim() === "");
      if (hasEmpty) {
        alert("Preencha todos os critérios antes de enviar.");
        return;
      }

      setIsSending(true);
      try {
        const payload = { cycleId, items };

        if (selfEvaluationId) {
          await axios.patch(`http://localhost:3000/self-evaluation/${selfEvaluationId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Autoavaliação atualizada com sucesso!");
        } else {
          await axios.post("http://localhost:3000/self-evaluation", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Autoavaliação enviada com sucesso!");
        }
      } catch (error: any) {
        console.error("Erro ao enviar:", error);
        alert("Erro ao enviar avaliação.");
      } finally {
        setIsSending(false);
      }
    };

    registerSubmitHandler("self-evaluation", submitSelfEvaluation);
  }, [ratings, justifications, selfEvaluationId, cycleId]);

  return (
    <div className="pb-24">
      {trackData.CriterionGroup.map((group) => (
        <SelfEvaluationForm
          key={group.id}
          title={group.name}
          cycleId={cycleId}
          criteria={group.configuredCriteria.map((cc, i) => ({
            id: cc.criterion.id,
            title: cc.criterion.displayName,
            description: cc.criterion.generalDescription,
            score: ratings[group.id]?.[i] ?? 0,
            justification: justifications[group.id]?.[i] ?? "",
          }))}
          readOnly={false}
          onRatingChange={(i, v) => handleRatingChange(group.id, i, v)}
          onJustificationChange={(i, v) => handleJustificationChange(group.id, i, v)}
        />
      ))}
    </div>
  );
};

export default SelfEvaluationGroupList;
