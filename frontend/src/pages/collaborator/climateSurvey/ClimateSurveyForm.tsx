import { useEffect, useState } from "react";
import axios from "axios";
import {
  BsEmojiAngry,
  BsEmojiFrown,
  BsEmojiNeutral,
  BsEmojiSmile,
  BsEmojiLaughing,
} from "react-icons/bs";
import { FaChevronUp, FaChevronDown, FaCheckCircle } from "react-icons/fa";
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
  const [isOpen, setIsOpen] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const hashIdKey = "climate-survey-hash-id";

  const isEditable = survey && new Date(survey.endDate) > new Date();

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        const res = await axios.get("http://localhost:3000/collaborator/climate-surveys/active", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSurvey(res.data);

        const hashId = getHashId();
        const responseRes = await axios.get(
          `http://localhost:3000/collaborator/climate-surveys/${res.data.id}/responses/${hashId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const previousAnswers = responseRes.data.answers || [];
        const mappedAnswers: Record<number, string> = {};
        const mappedJustifications: Record<number, string> = {};
        const opened: Record<number, boolean> = {};

        previousAnswers.forEach((a: any) => {
          mappedAnswers[a.questionId] = a.level;
          mappedJustifications[a.questionId] = a.justification;
          opened[a.questionId] = true;
        });

        setAnswers(mappedAnswers);
        setJustifications(mappedJustifications);
        setIsOpen(opened);
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
    if (!isEditable) return;
    setAnswers((prev) => ({ ...prev, [questionId]: level }));
  };

  const handleJustify = (questionId: number, value: string) => {
    if (!isEditable) return;
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
    <div className="flex flex-col min-h-screen bg-[#f1f1f1]">
      <header className="bg-white px-4 sm:px-8 py-6 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-semibold text-green-main">{survey.title}</h1>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isEditable}
          className="bg-green-main text-white px-6 py-2 rounded-lg hover:bg-green-main/90 disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Concluir e Enviar"}
        </button>
      </header>

      <div className="p-4 sm:p-8 space-y-6">
        {survey.questions.map((q: any, i: number) => {
          const isComplete = answers[q.id] && justifications[q.id]?.trim().length > 0;
          const open = isOpen[q.id] ?? true;

          return (
            <div key={q.id} className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <FaCheckCircle className="text-green-600 w-5 h-5" />
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border border-black text-xs text-black">
                      {i + 1}
                    </div>
                  )}
                  <p className="font-semibold">{q.text}</p>
                </div>
                <button onClick={() => setIsOpen((prev) => ({ ...prev, [q.id]: !open }))}>
                  {open ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              {open && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    {emojiLevels.map(({ icon: Icon, label, cor }) => (
                      <button
                        key={label}
                        className={`flex flex-col items-center px-3 py-2 rounded-xl border ${
                          answers[q.id] === label
                            ? "bg-gray-100 border-green-main scale-105"
                            : "hover:bg-gray-50 border-transparent"
                        } transition`}
                        onClick={() => handleSelect(q.id, label)}
                        disabled={!isEditable}
                      >
                        <Icon className={`text-3xl ${cor}`} />
                        <span className="text-xs mt-1 text-center">{label.replace("_", " ")}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label htmlFor={`justification-${q.id}`} className="block text-sm mb-1 text-gray-600">
                      Justifique sua resposta
                    </label>
                    <textarea
                      id={`justification-${q.id}`}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-green-main/50"
                      rows={3}
                      placeholder="Justifique sua resposta (opcional)"
                      value={justifications[q.id] || ""}
                      onChange={(e) => handleJustify(q.id, e.target.value)}
                      disabled={!isEditable}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
