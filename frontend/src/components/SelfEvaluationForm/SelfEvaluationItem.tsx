import { useEffect, useState } from "react";
import axios from "axios";
import {
  BsEmojiAngry,
  BsEmojiFrown,
  BsEmojiNeutral,
  BsEmojiSmile,
  BsEmojiLaughing,
} from "react-icons/bs";
import { FaCheckCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/AuthContext";

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
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const hashIdKey = "climate-survey-hash-id";

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const res = await axios.get("http://localhost:3000/collaborator/climate-surveys/active", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!survey) return <p className="p-6">Carregando pesquisa...</p>;
  if (!Array.isArray(survey.questions) || survey.questions.length === 0) {
    return <p className="p-6">Nenhuma pergunta encontrada para essa pesquisa.</p>;
  }

  return (
    <div className="flex flex-col h-full bg-[#f1f1f1]">
      {/* Header fixo e mais alto */}
      <header className="bg-white px-4 sm:px-8 py-6 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-green-main">{survey.title}</h1>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-main text-white px-6 py-2 rounded-lg hover:bg-green-main/90 disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Concluir e Enviar"}
        </button>
      </header>

      {/* Conteúdo com perguntas */}
      <main className="p-4 sm:p-8 space-y-6">
        {survey.questions.map((q: any, i: number) => {
          const isComplete = !!answers[q.id];
          const isOpen = expanded[q.id] ?? true;

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl shadow p-6 border border-gray-200"
            >
              {/* Header da pergunta */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <FaCheckCircle
                      className="text-green-600 w-5 h-5"
                      title="Pergunta respondida"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 flex items-center justify-center rounded-full border border-black text-xs text-black"
                      title={`Pergunta ${i + 1}`}
                    >
                      {i + 1}
                    </div>
                  )}
                  <span className="font-semibold">{q.text}</span>
                </div>

                <button onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !isOpen }))}>
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              {/* Corpo expandido */}
              {isOpen && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 mb-2">
                    {emojiLevels.map(({ icon: Icon, label, cor }) => (
                      <button
                        key={label}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border ${
                          answers[q.id] === label
                            ? "bg-gray-100 border-green-main scale-105"
                            : "hover:bg-gray-50 border-transparent"
                        } transition`}
                        onClick={() => handleSelect(q.id, label)}
                      >
                        <Icon className={`text-3xl ${cor}`} />
                        <span className="text-xs mt-1 text-center">
                          {label.replace(/_/g, " ")}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label
                      htmlFor={`justification-${q.id}`}
                      className="block text-sm mb-1 text-gray-600"
                    >
                      Justifique sua resposta (opcional)
                    </label>
                    <textarea
                      id={`justification-${q.id}`}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-green-main/50"
                      rows={3}
                      placeholder="Escreva aqui..."
                      value={justifications[q.id] || ""}
                      onChange={(e) => handleJustify(q.id, e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
