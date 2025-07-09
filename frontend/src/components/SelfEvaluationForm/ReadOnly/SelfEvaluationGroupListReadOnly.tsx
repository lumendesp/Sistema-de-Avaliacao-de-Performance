import { useEffect, useState } from "react";
import axios from "axios";
import SelfEvaluationFormReadOnly from "./SelfEvaluationFormReadOnly";
import { useAuth } from "../../../context/AuthContext";
import type { TrackWithGroups } from "../../../types/selfEvaluation";

interface Props {
  cycleId: number;
  trackData: TrackWithGroups;
}

const SelfEvaluationGroupReadOnlyList = ({ cycleId, trackData }: Props) => {
  const { token } = useAuth();
  const [ratings, setRatings] = useState<Record<number, number[]>>({});
  const [justifications, setJustifications] = useState<Record<number, string[]>>({});
  const [weights, setWeights] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/rh-criteria/tracks/with-criteria",
          { headers: { Authorization: `Bearer ${token}` } }
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
    const fetch = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/self-evaluation?cycleId=${cycleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const current = response.data.find((e: any) => e.cycle.id === cycleId);
        if (current) {
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
        console.error("Erro ao buscar autoavaliação:", e);
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

  return (
    <div className="pb-24">
      {trackData.CriterionGroup.map((group) => (
        <SelfEvaluationFormReadOnly
          key={group.id}
          title={group.name}
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
        />
      ))}
    </div>
  );
};

export default SelfEvaluationGroupReadOnlyList;
