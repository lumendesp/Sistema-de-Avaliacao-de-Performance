import { useEffect, useState } from "react";
import axios from "axios";
import EvaluationComparisonForm from "./ComparisonEvaluationForm";
import { useAuth } from "../../context/AuthContext";

interface Props {
  cycleId: number;
}

interface GroupedResponse {
  groupId: number;
  groupName: string;
  criteria: {
    criterionId: number;
    title: string;
    description: string;
    score: number;
    justification: string;
  }[];
}

const EvaluationComparisonGroupList = ({ cycleId }: Props) => {
  const { token } = useAuth();
  const [groupedData, setGroupedData] = useState<GroupedResponse[]>([]);

  useEffect(() => {
    const fetchGrouped = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/self-evaluation/grouped/${cycleId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGroupedData(res.data);
      } catch (err) {
        console.error("Erro ao buscar autoavaliação agrupada:", err);
      }
    };

    fetchGrouped();
  }, [cycleId, token]);

  if (!groupedData.length) return <div>Nenhuma resposta para este ciclo.</div>;

  return (
    <div className="p-3 bg-[#f1f1f1] space-y-6">
      {groupedData.map((group) => (
        <EvaluationComparisonForm
          key={group.groupId}
          title={group.groupName}
          criteria={group.criteria.map((c) => ({
            title: c.title,
            selfScore: c.score,
            finalScore: 0, // ou substitua se você tiver essa informação
            justification: c.justification,
          }))}
        />
      ))}
    </div>
  );
};

export default EvaluationComparisonGroupList;
