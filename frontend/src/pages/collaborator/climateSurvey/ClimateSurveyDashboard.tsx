import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoArrowForward } from "react-icons/io5";

export default function ClimateSurveyDashboard() {
  const [activeSurvey, setActiveSurvey] = useState<any | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [activeRes, answeredRes] = await Promise.all([
          axios.get("/collaborator/climate-surveys/active"),
          axios.get("/collaborator/climate-surveys/answered/count"),
        ]);

        setActiveSurvey(activeRes.data);
        setAnsweredCount(answeredRes.data?.total || 0);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };

    loadData();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#08605F]">Pesquisa de Clima</h1>

      {activeSurvey ? (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h2 className="text-xl font-semibold">{activeSurvey.title}</h2>
          <p className="text-gray-600 mb-2">{activeSurvey.description}</p>
          <p className="text-sm text-gray-500 mb-4">
            A pesquisa termina em: {formatDate(activeSurvey.endDate)}
          </p>
          <button
            className="bg-[#08605F] text-white px-4 py-2 rounded hover:bg-opacity-90"
            onClick={() => navigate("/collaborator/climate-survey/form")}
          >
            Responder agora
          </button>
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma pesquisa de clima ativa no momento.</p>
      )}

      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-2">Pesquisas Anteriores</h2>
        <p className="text-sm text-gray-600 mb-3">
          Você respondeu {answeredCount} pesquisa{answeredCount !== 1 && "s"} até agora.
        </p>
        <p className="text-gray-500">Nenhuma pesquisa anterior disponível.</p>
      </div>
    </div>
  );
}
