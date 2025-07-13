import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClimateSurveyById,
  closeClimateSurvey,
  getClimateSurveyResponses,
} from "../../../services/api";
import {
  IoArrowBack,
  IoCalendar,
  IoPeople,
  IoEye,
} from "react-icons/io5";
import type {
  ClimateSurvey,
  ClimateSurveyResponse,
} from "../../../types/climateSurvey";
import { getMotivationLevelText } from "../../../types/climateSurvey";
import SurveyStatusBadge from "../../../components/RH/SurveyStatusBadge/SurveyStatusBadge";

const RHClimateSurveyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<ClimateSurvey | null>(null);
  const [responses, setResponses] = useState<ClimateSurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const surveyData = await getClimateSurveyById(parseInt(id));
        setSurvey(surveyData);
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

  const handleCloseSurvey = async () => {
    if (
      !survey ||
      !window.confirm("Tem certeza que deseja encerrar esta pesquisa?")
    )
      return;

    try {
      setActionLoading(true);
      await closeClimateSurvey(survey.id);
      setSurvey((prev) => (prev ? { ...prev, isActive: false } : null));
      alert("Pesquisa encerrada com sucesso!");
    } catch (error) {
      console.error("Erro ao encerrar pesquisa:", error);
      alert("Erro ao encerrar pesquisa");
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

  const loadResponses = async () => {
    if (!id) return;

    try {
      setResponsesLoading(true);
      const responsesData = await getClimateSurveyResponses(parseInt(id));
      setResponses(responsesData);
    } catch (error) {
      console.error("Erro ao carregar respostas:", error);
      alert("Erro ao carregar respostas");
    } finally {
      setResponsesLoading(false);
    }
  };

  const toggleResponses = () => {
    if (!showResponses && responses.length === 0) {
      loadResponses();
    }
    setShowResponses(!showResponses);
  };

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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("../climate-survey")}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <IoArrowBack size={20} />
          </button>
          <div className="flex items-center gap-3">
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
              className="px-4 py-2 bg-gray-200 text-gray-600 font-semibold rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
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
              <div key={question.id} className="flex items-start gap-3">
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

      <div className="border border-gray-300 rounded-lg bg-white mt-6">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#08605F]">
            Respostas ({survey._count?.responses || 0})
          </h2>
          <button
            onClick={toggleResponses}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-[#08605F] rounded hover:bg-gray-200 transition-colors"
          >
            <IoEye size={16} />
            {showResponses ? "Ocultar" : "Visualizar"} Respostas
          </button>
        </div>

        {showResponses && (
          <div className="p-4">
            {responsesLoading ? (
              <div className="text-center py-4 text-gray-500">
                Carregando respostas...
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhuma resposta encontrada
              </div>
            ) : (
              <div className="space-y-6">
                {responses.map((response, idx) => (
                  <div
                    key={response.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Resposta #{idx + 1}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {response.answers.map((answer) => (
                        <div
                          key={answer.id}
                          className="border-l-4 border-[#08605F] pl-3"
                        >
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {answer.question.text}
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Nível:</strong>{" "}
                              {getMotivationLevelText(answer.level)}
                            </p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Justificativa:</strong>{" "}
                              {answer.justification}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RHClimateSurveyDetail;
