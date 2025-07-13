import { useState } from "react";
import RHCircularProgressCard from "../../../components/RH/RHCircularProgressCard/RHCircularProgressCard";
import RHClimateMetricCard from "../../../components/RH/RHClimateMetricCard/RHClimateMetricCard";
import RHColoredMetricCard from "../../../components/RH/RHColoredMetricCard/RHColoredMetricCard";
import SurveyRow from "../../../components/RH/SurveyRow/SurveyRow";
import SatisfactionChartCard from "../../../components/RH/SatisfactionChartCard/SatisfactionChartCard";
import type { SurveyStatus } from "../../../types/surveyStatus";

interface Survey {
  title: string;
  date: string;
  status: SurveyStatus;
}

const RHClimateSurvey = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  // Dados mockados (substituir depois por fetch real)
  const totalSurveys = 1;
  const totalResponses = 12;
  const completionPercentage = Math.round(
    (totalResponses / (totalSurveys * 10)) * 100
  ); // ex: 10 respostas esperadas por pesquisa

  const mockSurveys: Survey[] = [
    {
      title: "Clima 2024.2",
      date: "Fechada em 10/05/2024",
      status: "fechada",
    },
    {
      title: "Clima 2025.1",
      date: "Aberta desde 01/07/2025",
      status: "aberta",
    },
  ];

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Clima Organizacional
        </h1>
        <div className="w-12 h-12 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold text-lg">
          RH
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RHCircularProgressCard
          title="Preenchimento da Pesquisa"
          percentage={completionPercentage}
          description={`${totalResponses} colaboradores já responderam à pesquisa`}
        />
        <RHClimateMetricCard
          title="Análise de Sentimento"
          description="Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
          value={40}
        />

        <RHColoredMetricCard
          title="Fechamento da Pesquisa"
          description="Faltam 30 dias para o fechamento do ciclo, no dia 30/08/2025"
          value={3}
          unit="dias"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Lado esquerdo: Pesquisas anteriores */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Pesquisas de clima e engajamento
            </h2>
            <a
              href="#"
              className="text-blue-500 hover:underline font-medium text-sm"
            >
              Ver todas
            </a>
          </div>
          <div className="flex flex-col gap-y-2 max-h-[350px] overflow-y-auto pr-2">
            {mockSurveys.map((s, i) => (
              <SurveyRow
                key={i}
                title={s.title}
                date={s.date}
                status={s.status}
              />
            ))}
          </div>
        </div>

        {/* Lado direito: Gráfico de satisfação */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <SatisfactionChartCard
            title="Satisfação ao longo do tempo"
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={["2025", "2024", "2023"]}
            chartData={{
              labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
              datasets: [
                {
                  label: "Nota média (1 a 5)",
                  data: [4.2, 3.9, 4.5, 4.0, 4.3, 4.1],
                  backgroundColor: "#5A67D8",
                  borderRadius: 5,
                  maxBarThickness: 40,
                },
              ],
            }}
          />
        </div>
      </section>
    </>
  );
};

export default RHClimateSurvey;
