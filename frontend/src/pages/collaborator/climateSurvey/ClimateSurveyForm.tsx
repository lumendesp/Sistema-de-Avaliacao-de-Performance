import { useEffect, useState } from "react";
import axios from "axios";
import {
  BsEmojiAngry,
  BsEmojiFrown,
  BsEmojiNeutral,
  BsEmojiSmile,
  BsEmojiLaughing,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../../context/AuthContext";

const emojiLevels = [
  { icon: BsEmojiAngry, label: "DISCORDO_TOTALMENTE", cor: "text-red-500" },
  { icon: BsEmojiFrown, label: "DISCORDO_PARCIALMENTE", cor: "text-orange-500" },
  { icon: BsEmojiNeutral, label: "NEUTRO", cor: "text-yellow-500" },
  { icon: BsEmojiSmile, label: "CONCORDO_PARCIALMENTE", cor: "text-green-500" },
  { icon: BsEmojiLaughing, label: "CONCORDO_TOTALMENTE", cor: "text-emerald-500" },
];

export default function ClimateSurveyForm() {
  const { token } = useAuth();
  const [survey, setSurvey] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [justifications, setJustifications] = useState<Record<number, string>>({});
  const navigate = useNavigate();

  const hashIdKey = "climate-survey-hash-id";

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const res = await axios.get("http://localhost:3000/collaborator/climate-surveys/active", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Pesquisa carregada:", res.data);
        setSurvey(res.data);
      } catch (err) {
        console.error("Erro ao carregar pesquisa:", err);
      }
    };

    loadSurvey();
  }, [token]);

  const getHashId = () => {
    let hashId = localStorage.getItem(hashIdKey);
    if (!hashId) {
      hashId = uuidv4();
      localStorage.setItem(hashIdKey, hashId);
    }
    return hashId;
  };

  const handleSelect = (questionId: number, level: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: level }));
  };

  const handleJustify = (questionId: number, value: string) => {
    setJustifications((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!survey || !Array.isArray(survey.questions)) return;

    const payload = {
      hashId: getHashId(),
      isSubmit: true,
      answers: survey.questions.map((q: any) => ({
        questionId: q.id,
        level: answers[q.id],
        justification: justifications[q.id] ?? "",
      })),
    };

    try {
      await axios.post(
        `http://localhost:3000/collaborator/climate-surveys/${survey.id}/responses`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Obrigado por responder à pesquisa!");
      navigate("/collaborator/climate-survey");
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert("Erro ao enviar respostas. Tente novamente.");
    }
  };

  if (!survey) return <p className="p-6">Carregando pesquisa...</p>;
  if (!Array.isArray(survey.questions) || survey.questions.length === 0) {
    return <p className="p-6">Nenhuma pergunta encontrada para essa pesquisa.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-[#08605F] mb-4">{survey.title}</h1>
      <div className="space-y-6">
        {survey.questions.map((q: any, i: number) => (
          <div key={q.id} className="bg-white p-4 rounded border shadow-sm">
            <p className="mb-3 font-medium">
              {i + 1}. {q.text}
            </p>
            <div className="flex gap-4 mb-3">
              {emojiLevels.map(({ icon: Icon, label, cor }) => (
                <button
                  key={label}
                  className={`flex flex-col items-center px-2 py-1 rounded transition ${
                    answers[q.id] === label ? "bg-gray-100 scale-110" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelect(q.id, label)}
                >
                  <Icon className={`text-3xl ${cor}`} />
                  <span className="text-xs mt-1 text-center">
                    {label.replace("_", " ")}
                  </span>
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Justifique sua resposta (opcional)"
              value={justifications[q.id] || ""}
              onChange={(e) => handleJustify(q.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-6 text-right">
        <button
          className="bg-[#08605F] text-white px-6 py-2 rounded hover:bg-opacity-90"
          onClick={handleSubmit}
        >
          Enviar Respostas
        </button>
      </div>
    </div>
  );
}
