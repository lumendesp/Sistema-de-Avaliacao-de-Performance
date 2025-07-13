import React, { useState } from "react";
import { IoFunnel } from "react-icons/io5";
import SurveyStatusBadge from "../../../components/RH/SurveyStatusBadge/SurveyStatusBadge";
import SurveysSearchBar from "../../../components/RH/SurveysSearchBar";

interface Survey {
  id: number;
  title: string;
  status: "aberta" | "fechada";
  averageScore: number;
}

const mockSurveys: Survey[] = [
  { id: 1, title: "Clima 2024.2", status: "fechada", averageScore: 3.8 },
  { id: 2, title: "Clima 2025.1", status: "aberta", averageScore: 4.1 },
];

const RHSurveys: React.FC = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const filteredSurveys = selectedSurvey
    ? mockSurveys.filter((s) => s.id === selectedSurvey.id)
    : mockSurveys;

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pesquisas</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="w-full">
          <SurveysSearchBar onSelect={setSelectedSurvey} />
        </div>
        <button className="ml-4 bg-[#08605F] p-3 rounded-md text-white">
          <IoFunnel size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {filteredSurveys.length > 0 ? (
          filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div className="flex gap-3">
                <p className="font-semibold text-gray-800">{survey.title}</p>
                <SurveyStatusBadge status={survey.status} />
              </div>
              <div className="text-lg font-bold text-gray-700">
                {survey.averageScore.toFixed(1)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">
              Nenhuma pesquisa encontrada para sua busca.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RHSurveys;
