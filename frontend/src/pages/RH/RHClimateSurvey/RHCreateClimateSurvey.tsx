import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClimateSurvey } from "../../../services/api";
import { IoTrash, IoArrowBack } from "react-icons/io5";

interface Question {
  id: string;
  text: string;
}

const RHCreateClimateSurvey = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "" },
  ]);

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([...questions, { id: newId, text: "" }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Por favor, insira um título para a pesquisa");
      return;
    }

    if (!endDate) {
      alert("Por favor, selecione uma data de encerramento");
      return;
    }

    const validQuestions = questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      alert("Por favor, adicione pelo menos uma pergunta");
      return;
    }

    try {
      setLoading(true);
      await createClimateSurvey({
        title: title.trim(),
        description: description.trim() || undefined,
        endDate,
        questions: validQuestions.map((q) => ({ text: q.text.trim() })),
      });

      alert("Pesquisa criada com sucesso!");
      navigate("../climate-survey");
    } catch (error) {
      console.error("Erro ao criar pesquisa:", error);
      alert("Erro ao criar pesquisa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

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
          <h1 className="text-2xl font-bold text-gray-800">
            Nova Pesquisa de Clima
          </h1>
        </div>
        <button
          className="bg-[#08605F] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar Pesquisa"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-gray-300 rounded-lg bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#08605F]">
              Informações Básicas
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Título da Pesquisa *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent"
                placeholder="Ex: Clima Organizacional 2025.1"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent"
                placeholder="Descreva o objetivo desta pesquisa..."
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data de Encerramento *
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={getMinDate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg bg-white">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#08605F]">
              Perguntas da Pesquisa
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="px-2 py-1 text-xs bg-gray-100 text-[#08605F] rounded hover:bg-gray-200 transition-colors"
            >
              Adicionar Pergunta
            </button>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mt-2">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={question.text}
                      onChange={(e) =>
                        updateQuestion(question.id, e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent text-sm"
                      placeholder={`Pergunta ${index + 1}...`}
                    />
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors mt-2"
                    >
                      <IoTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {questions.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">
                Adicione pelo menos uma pergunta para continuar
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default RHCreateClimateSurvey;
