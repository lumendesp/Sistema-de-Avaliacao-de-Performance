import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../services/api";
import ClimateSurveyStatusButton from "../../../components/ClimateSurvey/ClimateSurveyStatusButton";

interface ClimateSurvey {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  endDate: string;
}

export default function ClimateSurveyDashboard() {
  const { token } = useAuth();
  const [activeSurvey, setActiveSurvey] = useState<ClimateSurvey | null>(null);
  const [answeredSurveys, setAnsweredSurveys] = useState<ClimateSurvey[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Tenta buscar a pesquisa ativa separadamente
        const activeRes = await axios
          .get(`${API_URL}/collaborator/climate-surveys/active`, { headers })
          .then((res) => res.data)
          .catch((err) => {
            console.warn("⚠️ Nenhuma pesquisa ativa encontrada:", err.response?.status);
            return null;
          });

        if (
          activeRes &&
          activeRes.id &&
          activeRes.isActive &&
          new Date(activeRes.endDate) > new Date()
        ) {
          setActiveSurvey(activeRes);
        } else {
          setActiveSurvey(null);
        }
      } catch (err) {
        console.error("❌ Erro inesperado ao buscar pesquisa ativa:", err);
        setActiveSurvey(null);
      }

      try {
        const answeredRes = await axios.get(`${API_URL}/collaborator/climate-surveys/answered`, {
          headers,
        });

        setAnsweredSurveys(answeredRes.data || []);
      } catch (err) {
        console.error("❌ Erro ao buscar pesquisas anteriores:", err);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  return (
    <div className="p-10 space-y-6 bg-[#f1f1f1] min-h-screen">
      <h1 className="text-2xl font-bold text-[#08605F]">Pesquisa de Clima Organizacional</h1>

      <ClimateSurveyStatusButton survey={activeSurvey} />

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-2">Pesquisas Anteriores</h2>
        <p className="text-sm text-gray-600 mb-3">
          Você respondeu {answeredSurveys.length} pesquisa{answeredSurveys.length !== 1 && "s"} até agora.
        </p>

        {answeredSurveys.length > 0 ? (
          <ul className="space-y-2">
            {answeredSurveys.map((survey) => (
              <li key={survey.id} className="text-gray-700">
                <span className="font-medium">{survey.title}</span> — finalizada em{" "}
                {new Date(survey.endDate).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma pesquisa anterior disponível.</p>
        )}
      </div>
    </div>
  );
}
