import React, { useEffect } from "react";
import CriteriaSection from "../../components/manager/CriteriaSection";
import type { EvaluationCriterion } from "../../types/EvaluationManager.tsx";
import { useParams, useOutletContext } from "react-router-dom";
import {
  fetchManagerEvaluation,
  createManagerEvaluation,
  updateManagerEvaluation,
} from "../../services/api";

// Critérios comportamentais (grupo 1)
const comportamentais: EvaluationCriterion[] = [
  {
    id: 1,
    title: "Resiliência nas adversidades",
    selfRating: 4,
    selfJustification: "Demonstrei resiliência em situações complicadas.",
    managerRating: undefined,
    managerJustification: "",
  },
  {
    id: 2,
    title: "Sentimento de dono",
    selfRating: 4,
    selfJustification: "Atuei com senso de dono nas entregas.",
    managerRating: undefined,
    managerJustification: "",
  },
];

// Critérios técnicos (grupo 2)
const tecnicos: EvaluationCriterion[] = [
  {
    id: 3,
    title: "Organização no trabalho",
    selfRating: 5,
    selfJustification: "Organizei bem minhas tarefas e prazos.",
    managerRating: undefined,
    managerJustification: "",
  },
  {
    id: 4,
    title: "Atender aos prazos",
    selfRating: 4,
    selfJustification: "Cumpri os prazos estabelecidos.",
    managerRating: undefined,
    managerJustification: "",
  },
];

type OutletContextType = { setSubmit: (fn: () => Promise<boolean>, isUpdate: boolean) => void };

export default function CollaboratorEvaluation() {
  const { id: collaboratorId } = useParams();
  const [criteriaComportamentais, setCriteriaComportamentais] = React.useState<EvaluationCriterion[]>(comportamentais);
  const [criteriaTecnicos, setCriteriaTecnicos] = React.useState<EvaluationCriterion[]>(tecnicos);
  const [evaluationId, setEvaluationId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const outletContext = useOutletContext<OutletContextType>();

  // Exemplo: cicloId fixo, ajuste conforme necessário
  const cycleId = 1;

  useEffect(() => {
    if (collaboratorId) {
      fetchManagerEvaluation(Number(collaboratorId))
        .then((data) => {
          if (data && data.id && data.groups) {
            setEvaluationId(data.id);
            const grupo1 = data.groups.find((g: any) => g.groupId === 1);
            const grupo2 = data.groups.find((g: any) => g.groupId === 2);
            setCriteriaComportamentais(
              comportamentais.map((crit) => {
                const found = grupo1?.items.find((c: any) => c.criterionId === crit.id);
                return {
                  ...crit,
                  managerRating: found?.score ?? undefined,
                  managerJustification: found?.justification ?? '',
                };
              })
            );
            setCriteriaTecnicos(
              tecnicos.map((crit) => {
                const found = grupo2?.items.find((c: any) => c.criterionId === crit.id);
                return {
                  ...crit,
                  managerRating: found?.score ?? undefined,
                  managerJustification: found?.justification ?? '',
                };
              })
            );
          } else {
            setCriteriaComportamentais(comportamentais);
            setCriteriaTecnicos(tecnicos);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [collaboratorId]);

  const handleCriterionChange = (
    index: number,
    updated: Partial<EvaluationCriterion>
  ) => {
    setCriteriaComportamentais((prev) => {
      const newCriteria = [...prev];
      newCriteria[index] = { ...newCriteria[index], ...updated };
      return newCriteria;
    });
  };

  // Função para ser chamada pelo botão fixo do layout
  const handleSubmit = async () => {
    const groups = [
      {
        groupId: 1,
        groupName: "Competências Comportamentais",
        items: criteriaComportamentais.map((c) => ({
          criterionId: c.id,
          score: c.managerRating ?? 0,
          justification: c.managerJustification || "",
        })),
      },
      {
        groupId: 2,
        groupName: "Competências Técnicas",
        items: criteriaTecnicos.map((c) => ({
          criterionId: c.id,
          score: c.managerRating ?? 0,
          justification: c.managerJustification || "",
        })),
      },
    ];
    try {
      if (evaluationId) {
        await updateManagerEvaluation(Number(collaboratorId), { groups });
      } else {
        // Cria avaliação nova, mas só envia cycleId e evaluateeId se não existir
        await createManagerEvaluation({ evaluateeId: Number(collaboratorId), cycleId, groups });
      }
      return true;
    } catch (e) {
      console.error('Erro ao enviar avaliação:', e);
      return false;
    }
  };

  // Registra a função de submit no layout ao montar
  useEffect(() => {
    if (outletContext && outletContext.setSubmit) {
      outletContext.setSubmit(handleSubmit, true); // sempre update
    }
    // eslint-disable-next-line
  }, [criteriaComportamentais, criteriaTecnicos, evaluationId, collaboratorId]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="flex flex-col gap-8">
      <CriteriaSection
        title="Competências Comportamentais"
        criteria={criteriaComportamentais}
        onCriterionChange={(i, upd) => setCriteriaComportamentais((prev) => {
          const arr = [...prev];
          arr[i] = { ...arr[i], ...upd };
          return arr;
        })}
      />
      <CriteriaSection
        title="Competências Técnicas"
        criteria={criteriaTecnicos}
        onCriterionChange={(i, upd) => setCriteriaTecnicos((prev) => {
          const arr = [...prev];
          arr[i] = { ...arr[i], ...upd };
          return arr;
        })}
      />
    </div>
  );
}
