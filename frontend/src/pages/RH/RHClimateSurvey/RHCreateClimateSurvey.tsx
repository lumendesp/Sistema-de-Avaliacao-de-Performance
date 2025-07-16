import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClimateSurvey } from "../../../services/api";
import { IoTrash, IoArrowBack, IoClose } from "react-icons/io5";
import {
  BsEmojiAngry,
  BsEmojiFrown,
  BsEmojiNeutral,
  BsEmojiSmile,
  BsEmojiLaughing,
} from "react-icons/bs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale";
import { CustomDateInput } from "./CustomDateInput";
import { BsFillQuestionCircleFill } from "react-icons/bs";

registerLocale("pt-BR", ptBR);

interface Question {
  id: string;
  text: string;
}

const RHCreateClimateSurvey = () => {
  const navigate = useNavigate();
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
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

  const validQuestions = questions.filter((q) => q.text.trim());

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

    try {
      setLoading(true);
      await createClimateSurvey({
        title: title.trim(),
        description: description.trim() || undefined,
        endDate: endDate?.toISOString(),
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
    return new Date();
  };

  return (
    <div className="w-full mt-5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center md:gap-4 gap-0">
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
          className="bg-[#08605F] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 max-w-[200px]"
          onClick={handleSubmit}
          disabled={loading || validQuestions.length === 0}
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
            <div className="flex flex-col md:flex-row w-full gap-4">
              <div className="w-full md:w-3/4">
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
              <div className="w-full md:w-1/4">
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data de Encerramento *
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={getMinDate()}
                  locale="pt-BR"
                  customInput={<CustomDateInput />}
                  wrapperClassName="w-full"
                  popperPlacement="bottom-start"
                />
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent resize-none"
                placeholder="Descreva o objetivo desta pesquisa..."
              />
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg bg-white">
          <div className="p-4 border-b border-gray-200 flex md:flex-row flex-col md:justify-between md:items-center items-start md:gap-0 gap-1">
            <div className="flex items-center gap-2 font-semibold">
              <h2 className="text-lg font-semibold text-[#08605F]">
                Perguntas da Pesquisa
              </h2>
              <>
                <BsFillQuestionCircleFill
                  onClick={() => setShowExampleModal(true)}
                  className="text-green-main hover:text-gray-600 cursor-pointer w-4.5 h-4.5"
                />
              </>
            </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent text-sm resize-none"
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

      {showExampleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-5 md:p-0">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-[700px] p-6 relative">
            <div className="flex justify-between">
              <div className="flex flex-col mb-4 gap-1">
                <h2 className="text-lg font-bold text-[#08605F]">
                  Exemplo de pergunta e resposta
                </h2>
                <p className="text-gray-500 text-sm">
                  As perguntas devem ser formuladas no formato abaixo, alinhadas
                  ao padrão de resposta demonstrado. O colaborador também pode
                  acrescentar um campo de justificativa.
                </p>
              </div>
              <IoClose
                onClick={() => setShowExampleModal(false)}
                size={30}
                className="cursor-pointer md:min-w-8 min-w-5"
              />
            </div>
            <p className="mb-3 font-semibold">Formato de pergunta:</p>
            <p className="mb-4 text-gray-700">
              “Sinto que meu trabalho é reconhecido pela liderança.”
            </p>

            <p className="mb-3 font-semibold">Formato de resposta:</p>
            <div className="flex flex-col md:flex-row w-full gap-3 md:gap-0">
              <div className="flex sm:flex-col items-center sm:gap-1 gap-2">
                <BsEmojiAngry className="text-3xl text-red-500" />
                <span className="sm:text-center min-w-[130px] sm:max-w-[130px] w-full">
                  Discordo totalmente
                </span>
              </div>
              <div className="flex sm:flex-col items-center sm:gap-1 gap-2">
                <BsEmojiFrown className="text-3xl text-orange-500" />
                <span className="sm:text-center min-w-[130px] sm:max-w-[130px] w-full">
                  Discordo parcialmente
                </span>
              </div>
              <div className="flex sm:flex-col items-center sm:gap-1 gap-2">
                <BsEmojiNeutral className="text-3xl text-yellow-500" />
                <span className="sm:text-center  min-w-[130px] sm:max-w-[130px] w-full">
                  Neutro
                </span>
              </div>
              <div className="flex sm:flex-col items-center sm:gap-1 gap-2">
                <BsEmojiSmile className="text-3xl text-green-500" />
                <span className="sm:text-center  min-w-[130px] sm:max-w-[130px] w-full">
                  Concordo parcialmente
                </span>
              </div>
              <div className="flex sm:flex-col items-center sm:gap-1 gap-2">
                <BsEmojiLaughing className="text-3xl text-emerald-500" />
                <span className="sm:text-center  min-w-[130px] sm:max-w-[130px] w-full">
                  Concordo totalmente
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RHCreateClimateSurvey;
