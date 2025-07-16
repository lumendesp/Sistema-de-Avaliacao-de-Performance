import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClimateSurveyById,
  closeClimateSurvey,
} from "../../../services/api";
import { IoArrowBack, IoCalendar, IoPeople, } from "react-icons/io5";
import type {
  ClimateSurvey,
} from "../../../types/climateSurvey";
import SurveyStatusBadge from "../../../components/RH/SurveyStatusBadge/SurveyStatusBadge";
import AIIcon from "../../../assets/committee/AI_icon.svg"

const RHClimateSurveyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<ClimateSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
        <div className=" text-gray-700 whitespace-pre-wrap">
          {/* {summary || "Resumo não disponível."} */}
          <p>Aqui vai o resumo da IA</p>
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
