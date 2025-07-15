import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RHCircularProgressCard from "../../../components/RH/RHCircularProgressCard/RHCircularProgressCard";
import RHClimateMetricCard from "../../../components/RH/RHClimateMetricCard/RHClimateMetricCard";
import RHColoredMetricCard from "../../../components/RH/RHColoredMetricCard/RHColoredMetricCard";
import SurveyRow from "../../../components/RH/SurveyRow/SurveyRow";
import SatisfactionChartCard from "../../../components/RH/SatisfactionChartCard/SatisfactionChartCard";
import {
  getClimateSurveys,
  countCollaborators,
  getClimateSurveyResponses,
  getClimateSurveyAverages,
  getLastCompletedSurveyData,
  getAllClimateAISummaries,
} from "../../../services/api";
import type { SurveyStatus } from "../../../types/surveyStatus";
import type { ClimateSurvey } from "../../../types/climateSurvey";
import { IoAddCircle } from "react-icons/io5";

const RHClimateSurvey = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<ClimateSurvey[]>([]);
  const [collaboratorCount, setCollaboratorCount] = useState<number>(0);
  const [activeResponsesCount, setActiveResponsesCount] = useState<number>(0);
  const [satisfactionScore, setSatisfactionScore] = useState<number | null>(
    null
  );
  const [shortSummary, setShortSummary] = useState<string | null>(null);
  const [aiChartData, setAiChartData] = useState<any>(null);

  const activeSurvey = surveys.find((survey) => survey.isActive);

  const daysLeft = activeSurvey
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activeSurvey.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const completionPercentage =
    collaboratorCount > 0
      ? Math.round((activeResponsesCount / collaboratorCount) * 100)
      : 0;

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        setLoading(true);
        const [surveysData, countData] = await Promise.all([
          getClimateSurveys() as Promise<ClimateSurvey[]>,
          countCollaborators(),
        ]);
        setSurveys(surveysData);
        setCollaboratorCount(
          typeof countData === "number" ? countData : countData.count
        );
        // verifica se há pesquisa ativa e busca as respostas reais dela
        const currentActiveSurvey = surveysData.find((s) => s.isActive);
        if (currentActiveSurvey) {
          const responses = await getClimateSurveyResponses(
            currentActiveSurvey.id
          );
          setActiveResponsesCount(responses.length); // pega o count real
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // fallback apenas para surveys
        setSurveys([
          {
            id: 1,
            title: "Clima 2024.2",
            description: "Pesquisa de clima organizacional 2024.2",
            endDate: "2024-05-10",
            isActive: false,
            createdAt: "2024-01-01",
            createdById: 1,
            questions: [],
            _count: { responses: 8 },
          },
          {
            id: 2,
            title: "Clima 2025.1",
            description: "Pesquisa de clima organizacional 2025.1",
            endDate: "2025-08-30",
            isActive: true,
            createdAt: "2025-07-01",
            createdById: 1,
            questions: [],
            _count: { responses: 4 },
          },
        ]);
        setCollaboratorCount(10); // mock fallback
        setActiveResponsesCount(4); // mock fallback
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, []);

  useEffect(() => {
    const loadSurveyData = async () => {
      try {
        const data = await getLastCompletedSurveyData();
        setSatisfactionScore(data.satisfactionScore);
        setShortSummary(data.shortText);
      } catch (error) {
        console.log("Erro ao carregar dados da pesquisa:", error);
        setSatisfactionScore(null);
        setShortSummary(null);
      }
    };
    loadSurveyData();
  }, []);

  useEffect(() => {
    const loadAiChartData = async () => {
      try {
        const aiSummaries = await getAllClimateAISummaries();
        // Monta os dados do gráfico
        const labels = aiSummaries.map((s) => {
          const date = new Date(s.endDate);
          const month = date
            .toLocaleDateString("pt-BR", { month: "short" })
            .replace(".", "")
            .toUpperCase();
          return `${month}/${date.getFullYear()}`;
        });
        const data = aiSummaries.map((s) => s.satisfactionScore ?? 0);
        const tooltips = aiSummaries.map((s) => s.shortText ?? "");
        const backgroundColor = aiSummaries.map((s) => {
          if (s.satisfactionScore === null) return "#d1d5db";
          if (s.satisfactionScore <= 40) return "#ef4444";
          if (s.satisfactionScore <= 70) return "#eab308";
          return "#22c55e";
        });
        setAiChartData({
          labels,
          datasets: [
            {
              label: "Nota de Satisfação IA",
              data,
              backgroundColor,
              borderRadius: 5,
              maxBarThickness: 40,
            },
          ],
          tooltips,
        });
      } catch (error) {
        setAiChartData(null);
      }
    };
    loadAiChartData();
  }, []);

  const formatSurveyDate = (survey: ClimateSurvey) => {
    if (survey.isActive) {
      return `Aberta desde ${new Date(survey.createdAt).toLocaleDateString(
        "pt-BR"
      )}`;
    } else {
      return `Fechada em ${new Date(survey.endDate).toLocaleDateString(
        "pt-BR"
      )}`;
    }
  };

  const getSurveyStatus = (survey: ClimateSurvey): SurveyStatus => {
    return survey.isActive ? "aberta" : "fechada";
  };

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
        {activeSurvey ? (
          <>
            <RHCircularProgressCard
              title="Preenchimento da Pesquisa"
              percentage={completionPercentage}
              description={`${activeResponsesCount} de ${collaboratorCount} colaboradores já responderam à pesquisa`}
            />

            <RHColoredMetricCard
              title="Fechamento da Pesquisa"
              description={`Falta${daysLeft === 1 ? "" : "m"} ${daysLeft} dia${
                daysLeft === 1 ? "" : "s"
              } para o fechamento do ciclo, no dia ${new Date(
                activeSurvey.endDate
              ).toLocaleDateString("pt-BR")}`}
              value={daysLeft}
              unit={daysLeft === 1 ? "dia" : "dias"}
            />
          </>
        ) : (
          <>
            <RHCircularProgressCard
              title="Nenhuma pesquisa ativa"
              percentage={0}
              description="Não há pesquisa de clima aberta no momento"
            />
            <RHColoredMetricCard
              title="Crie uma nova pesquisa"
              description="Inicie uma nova pesquisa para conhecer melhor o clima da empresa"
              value={0}
              unit="dias"
            />
          </>
        )}

        <RHClimateMetricCard
          title="Análise de Sentimento"
          description={
            shortSummary ||
            "Nenhuma pesquisa finalizada ou resumo ainda não gerado"
          }
          value={satisfactionScore || 0}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Pesquisas de Clima
            </h2>
            <IoAddCircle
              size={27}
              className="text-[#08605F] cursor-pointer"
              onClick={() => navigate("../climate-survey/create")}
            />
          </div>
          <div className="flex flex-col gap-y-2 max-h-[350px] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Carregando...
              </div>
            ) : surveys.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhuma pesquisa encontrada
              </div>
            ) : (
              surveys.map((survey) => (
                <SurveyRow
                  key={survey.id}
                  id={survey.id}
                  title={survey.title}
                  date={formatSurveyDate(survey)}
                  status={getSurveyStatus(survey)}
                  onClick={() => navigate(`../climate-survey/${survey.id}`)}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <SatisfactionChartCard
            title="Evolução do Clima Organizacional (Nota IA)"
            chartData={
              aiChartData || { labels: [], datasets: [], tooltips: [] }
            }
          />
        </div>
      </section>
    </>
  );
};

export default RHClimateSurvey;
