import { useEffect, useState } from "react";
import axios from "axios";
import SelfEvaluationForm from "../../../components/SelfEvaluationForm/SelfEvaluationForm";
import { useAuth } from "../../../context/AuthContext";
import type { Criterion } from "../../../types/selfEvaluation";

export default function SelfEvaluationPage() {
  const { token } = useAuth();
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [availableRes, answeredRes] = await Promise.all([
          axios.get("http://localhost:3000/self-evaluation/available", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/self-evaluation", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const available = availableRes.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
        }));

        const answered = answeredRes.data.items ?? [];

        const combined = available.map((c: any) => {
          const response = answered.find((a: any) => a.criterionId === c.id);
          return {
            ...c,
            score: response?.score ?? 0,
            justification: response?.justification ?? "",
          };
        });

        setCriteria(combined);
        setReadOnly(answered.length > 0);
      } catch (err) {
        console.error("Erro ao carregar critérios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="p-3 bg-[#f1f1f1] mt-0">
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Carregando critérios...</p>
      ) : (
        <SelfEvaluationForm
          title="Critérios de Postura"
          criteria={criteria}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
