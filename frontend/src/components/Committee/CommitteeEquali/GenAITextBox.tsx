import AIIcon from "../../../assets/committee/AI-icon.png";
import { fetchAISummary } from "../../../services/api";
import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface GenAITextBoxProps {
  userId: number;
  cycleId: number;
}

function GenAITextBox({ userId, cycleId }: GenAITextBoxProps) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const result = await fetchAISummary(userId, cycleId);
        setSummary(result);
      } catch (err: any) {
        console.error("Erro ao carregar resumo IA:", err);
        setError("Erro ao carregar o resumo da IA.");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [userId, cycleId]);
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-[#08605F] pl-6">
      <div className="flex items-center gap-2 mb-4 justify-between">
        <div className="flex items-center gap-2">
          <img src={AIIcon} alt="Ícone IA" className="w-5 h-5" />
          <span className="text-sm font-semibold text-gray-700">Resumo</span>
        </div>
        <button
          className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? "Minimizar resumo" : "Expandir resumo"}
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      {expanded && (
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] mb-4"
          rows={5}
          value={
            loading
              ? "Carregando resumo..."
              : error
              ? error
              : summary || "Resumo não disponível."
          }
          disabled
        />
      )}
    </div>
  );
}

export default GenAITextBox;
