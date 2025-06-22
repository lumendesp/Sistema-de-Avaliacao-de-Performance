import React, { useState } from "react";
import CriteriaSection from "../../components/manager/CriteriaSection";
import type { EvaluationCriterion } from "../../types/EvaluationManager.tsx";

const initialCriteria: EvaluationCriterion[] = [
  {
    id: 1,
    title: "Sentimento de dono",
    selfRating: 4,
    selfJustification: "Sempre demonstrei me sentir dono do meu trabalho",
  },
  {
    id: 2,
    title: "Resiliência nas adversidades",
    selfRating: 4,
    selfJustification: "Me mostrei resiliente em situações complicadas",
    managerRating: 4,
    managerJustification: "Se mostrou resiliente em situações complicadas",
  },
  {
    id: 3,
    title: "Colaboração e trabalho em equipe",
    selfRating: 4,
    selfJustification: "Colaborei ativamente com a equipe",
  },
];

const initialEthicsCriteria: EvaluationCriterion[] = [
  {
    id: 101,
    title: "Integridade",
    selfRating: 5,
    selfJustification: "Sempre agi com honestidade e ética.",
  },
  {
    id: 102,
    title: "Respeito às normas",
    selfRating: 4,
    selfJustification: "Cumpro todas as normas e políticas da empresa.",
  },
];

export default function CollaboratorEvaluation() {
  // Usa estado para os critérios
  const [criteria, setCriteria] =
    useState<EvaluationCriterion[]>(initialCriteria);
  const [ethicsCriteria, setEthicsCriteria] = useState<EvaluationCriterion[]>(
    initialEthicsCriteria
  );

  // Atualiza um critério específico
  const handleCriterionChange = (
    index: number,
    updated: Partial<EvaluationCriterion>
  ) => {
    setCriteria((prev) => {
      const newCriteria = [...prev];
      newCriteria[index] = { ...newCriteria[index], ...updated };
      return newCriteria;
    });
  };

  const handleEthicsCriterionChange = (
    index: number,
    updated: Partial<EvaluationCriterion>
  ) => {
    setEthicsCriteria((prev) => {
      const newCriteria = [...prev];
      newCriteria[index] = { ...newCriteria[index], ...updated };
      return newCriteria;
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <CriteriaSection
        title="Critérios de Postura"
        criteria={criteria}
        onCriterionChange={handleCriterionChange}
      />
      <CriteriaSection
        title="Critérios Éticos"
        criteria={ethicsCriteria}
        onCriterionChange={handleEthicsCriterionChange}
      />
    </div>
  );
}
