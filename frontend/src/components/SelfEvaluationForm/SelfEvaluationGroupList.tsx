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
  const [justifications, setJustifications] = useState<
    Record<number, string[]>
  >({});
  const [selfEvaluationId, setSelfEvaluationId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [weights, setWeights] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/rh-criteria/tracks/with-criteria",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const weightMap: Record<number, number> = {};
        response.data.forEach((track: any) => {
          track.CriterionGroup.forEach((group: any) => {
            group.configuredCriteria.forEach((cc: any) => {
              const criterion = cc.criterion;
              if (criterion && criterion.id) {
                weightMap[criterion.id] = criterion.weight;
              }
            });
          });
        });

        setWeights(weightMap);
      } catch (err) {
        console.error("Erro ao buscar pesos dos critérios:", err);
      }
    };

    fetchWeights();
  }, [token]);

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

  const total = Object.values(ratings).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  const filled = Object.entries(ratings).reduce((count, [groupId, arr]) => {
    return (
      count +
      arr.filter((r, i) => r > 0 && justifications[Number(groupId)][i]?.trim())
        .length
    );
  }, 0);

  useEffect(() => {
    setIsComplete(filled === total);
  }, [ratings, justifications]);

  const saveDraft = async () => {
    const allItems = trackData.CriterionGroup.flatMap((group) =>
      group.configuredCriteria.map((cc, i) => ({
        criterionId: cc.criterion.id,
        score: ratings[group.id]?.[i] ?? 0,
        justification: justifications[group.id]?.[i] ?? "",
      }))
    );

    // 🚨 Filtra apenas os que têm nota ou justificativa
    const items = allItems.filter(
      (item) => item.score > 0 || item.justification.trim().length > 0
    );

    if (items.length === 0) return; // nada a salvar ainda

    let totalWeightedScore = 0;
    let totalWeight = 0;

    items.forEach((item) => {
      const weight = weights[item.criterionId] ?? 1;
      totalWeightedScore += item.score * weight;
      totalWeight += weight;
    });

    const averageScore =
      totalWeight > 0
        ? parseFloat((totalWeightedScore / totalWeight).toFixed(1))
        : 0;

    const payload = {
      cycleId,
      items,
      averageScore,
    };

    try {
      if (selfEvaluationId) {
        await axios.patch(
          `http://localhost:3000/self-evaluation/${selfEvaluationId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Atualizado.");
      } else {
        const res = await axios.post(
          `http://localhost:3000/self-evaluation`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSelfEvaluationId(res.data.id);
        setIsUpdate(true);
        console.log("Criado.");
      }
    } catch (err) {
      console.error("Erro ao salvar autoavaliação:", err);
    }
  };

  const handleRatingChange = (
    groupId: number,
    index: number,
    value: number
  ) => {
    const updated = [...ratings[groupId]];
    updated[index] = value;
    const newRatings = { ...ratings, [groupId]: updated };
    setRatings(newRatings);
  };

  const handleJustificationChange = (
    groupId: number,
    index: number,
    value: string
  ) => {
    const updated = [...justifications[groupId]];
    updated[index] = value;
    const newJustifications = { ...justifications, [groupId]: updated };
    setJustifications(newJustifications);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/self-evaluation?cycleId=${cycleId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const current = response.data.find((e: any) => e.cycle.id === cycleId);
        if (current) {
          setSelfEvaluationId(current.id);
          setIsUpdate(true);

          const groupedRatings: Record<number, number[]> = {};
          const groupedJustifications: Record<number, string[]> = {};

          trackData.CriterionGroup.forEach((group) => {
            groupedRatings[group.id] = [];
            groupedJustifications[group.id] = [];

            group.configuredCriteria.forEach((cc) => {
              const answer = current.items.find(
                (item: any) =>
                  item.criterionId === cc.criterion.id &&
                  item.group?.id === group.id
              );

              groupedRatings[group.id].push(answer?.score ?? 0);
              groupedJustifications[group.id].push(answer?.justification ?? "");
            });
          });

          setRatings(groupedRatings);
          setJustifications(groupedJustifications);
        }
      } catch (e) {
        console.error("Erro ao verificar avaliação existente:", e);
      }
    };

    fetch();
  }, [token, cycleId, trackData]);

  const calculateGroupAverage = (
    groupId: number,
    criteria: { id: number }[],
    scores: number[]
  ) => {
    let weightedSum = 0;
    let totalWeight = 0;

    criteria.forEach((c, i) => {
      const weight = weights[c.id] ?? 1;
      weightedSum += (scores[i] || 0) * weight;
      totalWeight += weight;
    });

    return totalWeight > 0
      ? parseFloat((weightedSum / totalWeight).toFixed(1))
      : 0;
  };

  useEffect(() => {
    const submitSelfEvaluation = async () => {
      const items = trackData.CriterionGroup.flatMap((group) =>
        group.configuredCriteria.map((cc, i) => ({
          criterionId: cc.criterion.id,
          score: ratings[group.id]?.[i] ?? 0,
          justification: justifications[group.id]?.[i] ?? "",
        }))
      );

      const hasEmpty = items.some(
        (item) => item.score <= 0 || item.justification.trim() === ""
      );
      if (hasEmpty) {
        alert("Preencha todos os critérios antes de enviar.");
        return;
      }

      let totalWeightedScore = 0;
      let totalWeight = 0;

      items.forEach((item) => {
        const weight = weights[item.criterionId] ?? 1;
        totalWeightedScore += item.score * weight;
        totalWeight += weight;
      });

      const averageScore =
        totalWeight > 0
          ? parseFloat((totalWeightedScore / totalWeight).toFixed(1))
          : 0;
      const payload = { cycleId, items, averageScore };

      setIsSending(true);
      try {
        if (selfEvaluationId) {
          await axios.patch(
            `http://localhost:3000/self-evaluation/${selfEvaluationId}`,
            payload,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
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
  }, [ratings, justifications, selfEvaluationId, cycleId, weights]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      saveDraft();
    }, 500); // pequeno delay para evitar múltiplas chamadas em sequência

    return () => clearTimeout(debounce);
  }, [ratings, justifications]);

  return (
    <div className="pb-24">
      {trackData.CriterionGroup.map((group) => (
        <SelfEvaluationForm
          key={group.id}
          title={group.name}
          cycleId={cycleId}
          averageScore={calculateGroupAverage(
            group.id,
            group.configuredCriteria.map((cc) => cc.criterion),
            ratings[group.id] ?? []
          )}
          criteria={group.configuredCriteria.map((cc, i) => ({
            id: cc.criterion.id,
            title: cc.criterion.displayName,
            description: cc.criterion.generalDescription,
            score: ratings[group.id]?.[i] ?? 0,
            justification: justifications[group.id]?.[i] ?? "",
          }))}
          readOnly={false}
          onRatingChange={(i, v) => handleRatingChange(group.id, i, v)}
          onJustificationChange={(i, v) =>
            handleJustificationChange(group.id, i, v)
          }
        />
      ))}
    </div>
  );
};

export default SelfEvaluationGroupList;
