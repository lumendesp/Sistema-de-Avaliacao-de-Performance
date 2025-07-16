import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClimateSurveyById,
  closeClimateSurvey,
  getClimateAISummary,
  generateClimateAISummary,
} from "../../../services/api";
import { IoArrowBack, IoCalendar, IoPeople } from "react-icons/io5";
import type { ClimateSurvey } from "../../../types/climateSurvey";
import SurveyStatusBadge from "../../../components/RH/SurveyStatusBadge/SurveyStatusBadge";
import AIIcon from "../../../assets/committee/AI_icon.svg";
import LoadingGif from "../../../assets/loadingGif.svg";

const RHClimateSurveyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<ClimateSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [shortSummary, setShortSummary] = useState<string | null>(null);
  const [satisfactionScore, setSatisfactionScore] = useState<number | null>(
    null
  );
  const [summaryStatus, setSummaryStatus] = useState<string>("pending");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const surveyData = await getClimateSurveyById(parseInt(id));
        setSurvey(surveyData);

        try {
          const summaryData = await getClimateAISummary(parseInt(id));
          setSummary(summaryData.text);
          setShortSummary(summaryData.shortText);
          setSatisfactionScore(summaryData.satisfactionScore);
          setSummaryStatus(summaryData.status);

          // Se o resumo está em processamento, inicia o polling
          if (summaryData.status === "processing") {
            console.log(
              "Resumo em processamento detectado, iniciando polling..."
            );
          }
        } catch (error) {
          console.error("Erro ao buscar resumo IA:", error);
          setSummary(null);
          setShortSummary(null);
          setSatisfactionScore(null);
          setSummaryStatus("failed");
        }
      } catch (error) {
        console.error("Erro ao carregar pesquisa:", error);
        alert("Erro ao carregar pesquisa");
        navigate("../climate-survey");
      } finally {
        setLoading(false);
      }
    };

    loadSurvey();
  }, [id, navigate]);

  // Polling para verificar status do resumo quando estiver em processamento
  useEffect(() => {
    if (summaryStatus !== "processing" || !id) return;

    const pollInterval = setInterval(async () => {
      try {
        const summaryData = await getClimateAISummary(parseInt(id));
        setSummary(summaryData.text);
        setShortSummary(summaryData.shortText);
        setSatisfactionScore(summaryData.satisfactionScore);
        setSummaryStatus(summaryData.status);

        // Para o polling quando o status não for mais 'processing'
        if (summaryData.status !== "processing") {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Erro ao verificar status do resumo:", error);
        setSummaryStatus("failed");
        clearInterval(pollInterval);
      }
    }, 3000); // Verifica a cada 3 segundos

    return () => clearInterval(pollInterval);
  }, [summaryStatus, id]);

  const handleCloseSurvey = async () => {
    if (
      !survey ||
      !window.confirm("Tem certeza que deseja encerrar esta pesquisa?")
    )
      return;

    try {
      setActionLoading(true);

      // Primeiro, encerra a pesquisa
      await closeClimateSurvey(survey.id);
      setSurvey((prev) => (prev ? { ...prev, isActive: false } : null));

      // Verifica o status atual do resumo antes de tentar gerar
      try {
        const currentSummaryData = await getClimateAISummary(survey.id);
        const currentStatus = currentSummaryData.status;

        if (currentStatus === "processing") {
          alert("Pesquisa encerrada! O resumo já está sendo gerado.");
          setSummaryStatus("processing");
          return;
        }

        if (currentStatus === "completed" && currentSummaryData.text) {
          alert("Pesquisa encerrada! O resumo já foi gerado.");
          setSummary(currentSummaryData.text);
          setShortSummary(currentSummaryData.shortText);
          setSatisfactionScore(currentSummaryData.satisfactionScore);
          setSummaryStatus("completed");
          return;
        }
      } catch (error) {
        console.log("Verificação de status falhou, continuando com geração...");
      }

      // Gera o resumo se não estiver em processamento ou já completo
      setSummaryLoading(true);
      setSummaryStatus("processing");
      try {
        const newSummaryData = await generateClimateAISummary(survey.id);
        setSummary(newSummaryData.text);
        setShortSummary(newSummaryData.shortText);
        setSatisfactionScore(newSummaryData.satisfactionScore);
        setSummaryStatus(newSummaryData.status);
        // alert("Pesquisa encerrada e resumo gerado com sucesso!");
      } catch (summaryError) {
        console.error("Erro ao gerar resumo:", summaryError);
        setSummaryStatus("failed");
        // Se o erro for sobre resumo já em processamento, não mostra como erro
        if (summaryError.message.includes("já está sendo gerado")) {
          alert("Pesquisa encerrada! O resumo já está sendo gerado.");
        }
      } finally {
        setSummaryLoading(false);
      }
    } catch (error) {
      console.error("Erro ao encerrar pesquisa:", error);
      alert("Erro ao encerrar pesquisa");
      setSummaryLoading(false);
    } finally {
      setActionLoading(false);
    }
  };

  // const handleReopenSurvey = async () => {
  //   if (
  //     !survey ||
  //     !window.confirm("Tem certeza que deseja reabrir esta pesquisa?")
  //   )
  //     return;

  //   try {
  //     setActionLoading(true);
  //     await reopenClimateSurvey(survey.id);
  //     setSurvey((prev) => (prev ? { ...prev, isActive: true } : null));
  //     alert("Pesquisa reaberta com sucesso!");
  //   } catch (error) {
  //     console.error("Erro ao reabrir pesquisa:", error);
  //     alert("Erro ao reabrir pesquisa");
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Pesquisa não encontrada</div>
      </div>
    );
  }

  console.log("summary:", summary);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 mt-5 gap-3 md:gap-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("../climate-survey")}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <IoArrowBack size={20} />
          </button>
          <div className="flex items-center gap-3 -m-3">
            <h1 className="text-2xl font-bold text-gray-800">{survey.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {survey.isActive ? (
                <SurveyStatusBadge status="aberta" />
              ) : (
                <SurveyStatusBadge status="fechada" />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {survey.isActive ? (
            <button
              onClick={handleCloseSurvey}
              disabled={actionLoading}
              className="px-4 py-2 bg-gray-200 text-gray-600 font-semibold rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 max-w-[200px]"
            >
              {actionLoading ? "Encerrando..." : "Encerrar Pesquisa"}
            </button>
          ) : (
            <></>
            // <button
            //   onClick={handleReopenSurvey}
            //   disabled={actionLoading}
            //   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            // >
            //   {actionLoading ? "Reabrindo..." : "Reabrir Pesquisa"}
            // </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <IoCalendar className="text-[#08605F]" size={20} />
            <h3 className="font-semibold text-gray-800">Data de Criação</h3>
          </div>
          <p className="text-gray-600">{formatDateTime(survey.createdAt)}</p>
        </div>

        <div className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <IoCalendar className="text-[#08605F]" size={20} />
            <h3 className="font-semibold text-gray-800">
              Data de Encerramento
            </h3>
          </div>
          <p className="text-gray-600">{formatDate(survey.endDate)}</p>
        </div>

        <div className="border border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <IoPeople className="text-[#08605F]" size={20} />
            <h3 className="font-semibold text-gray-800">Respostas</h3>
          </div>
          <p className="text-gray-600">
            {survey._count?.responses || 0} colaboradores
          </p>
        </div>
      </div>

      {/* Resumo estilo IA */}
      <div className="bg-white rounded-lg p-4 border border-gray-300 border-l-4 border-l-[#08605F] pl-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <img src={AIIcon} alt="IA Icon" className="w-4 h-4" />
          <span className="font-semibold text-[#08605F]">Resumo</span>
        </div>

        {summaryLoading || summaryStatus === "processing" ? (
          <div className="flex items-center gap-3">
            <img src={LoadingGif} alt="Carregando resumo" className="w-8 h-8" />
            <span className="text-gray-600">Gerando resumo com IA...</span>
          </div>
        ) : summaryStatus === "completed" &&
          typeof summary === "string" &&
          summary.length > 0 ? (
          <p>{summary}</p>
        ) : summaryStatus === "failed" ? (
          <div className="text-red-600">
            <p className="font-semibold">Erro ao gerar resumo</p>
            <p className="text-sm mb-3">
              Houve um problema ao processar o resumo.
            </p>
            <button
              onClick={async () => {
                try {
                  setSummaryStatus("processing");
                  const newSummaryData = await generateClimateAISummary(
                    parseInt(id!)
                  );
                  setSummary(newSummaryData.text);
                  setShortSummary(newSummaryData.shortText);
                  setSatisfactionScore(newSummaryData.satisfactionScore);
                  setSummaryStatus(newSummaryData.status);
                } catch (error) {
                  console.error(
                    "Erro ao tentar gerar resumo novamente:",
                    error
                  );
                  setSummaryStatus("failed");
                  alert(`Erro ao gerar resumo: ${error.message}`);
                }
              }}
              disabled={summaryStatus === "processing"}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
            >
              {summaryStatus === "processing"
                ? "Gerando..."
                : "Tentar novamente"}
            </button>
          </div>
        ) : summaryStatus === "pending" ? (
          <p className="italic text-gray-500">
            Resumo será gerado quando a pesquisa for encerrada.
          </p>
        ) : (
          <p className="text-gray-500">Resumo não disponível.</p>
        )}
      </div>

      {survey.description && (
        <div className="border border-gray-300 rounded-lg bg-white mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#08605F]">Descrição</h2>
          </div>
          <div className="p-4">
            <p className="text-gray-700">{survey.description}</p>
          </div>
        </div>
      )}

      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#08605F]">
            Perguntas ({survey.questions.length})
          </h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {survey.questions.map((question, index) => (
              <div key={question.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mt-1">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <p className="text-gray-800">{question.text}</p>
                </div>
              </div>
            ))}
          </div>

          {survey.questions.length === 0 && (
            <p className="text-gray-500 text-center py-4 text-sm">
              Nenhuma pergunta cadastrada
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RHClimateSurveyDetail;
