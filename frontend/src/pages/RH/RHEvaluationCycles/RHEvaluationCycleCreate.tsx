import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale";
import { IoArrowBack } from "react-icons/io5";
import { CustomDateInput } from "../RHClimateSurvey/CustomDateInput";

registerLocale("pt-BR", ptBR);

const RHEvaluationCycleCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor, insira um nome para o ciclo");
      return;
    }
    if (!startDate || !endDate) {
      alert("Por favor, selecione as datas de início e término");
      return;
    }
    if (endDate <= startDate) {
      alert("A data de término deve ser após a data de início");
      return;
    }
    try {
      setLoading(true);
      // Chama a rota de criar ciclo colaborador
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:3000/ciclos/create-collaborator-cycle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }),
        }
      );
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Erro ao criar ciclo avaliativo");
      }
      alert("Ciclo criado e aberto para colaboradores!");
      navigate("../cycles");
    } catch (error: any) {
      alert(error.message || "Erro ao criar ciclo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 mt-5 md:mt-0">
        <div className="flex items-center md:gap-4 gap-1">
          <button
            onClick={() => navigate("../cycles")}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <IoArrowBack size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Novo Ciclo Avaliativo
          </h1>
        </div>
        <button
          className="bg-[#08605F] text-white px-4 py-2 mt-3 md:mt-0 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 max-w-[200px]"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar Ciclo"}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-gray-300 rounded-lg bg-white">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#08605F]">
              Informações do Ciclo
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex md:flex-row flex-col w-full gap-4">
              <div className="w-full md:w-2/4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nome do Ciclo *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] focus:border-transparent"
                  placeholder="Ex: 2024.2"
                  required
                />
              </div>
              <div className="w-full md:w-1/4">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data de Início *
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  locale="pt-BR"
                  customInput={<CustomDateInput />}
                  wrapperClassName="w-full"
                  popperPlacement="bottom-start"
                />
              </div>
              <div className="w-full md:w-1/4">
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data de Término *
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  minDate={startDate || new Date()}
                  locale="pt-BR"
                  customInput={<CustomDateInput />}
                  wrapperClassName="w-full"
                  popperPlacement="bottom-start"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RHEvaluationCycleCreate;
