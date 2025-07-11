import React, { useEffect, useState } from "react";
import Metricas from "../../components/BrutalFacts/Metricas";
import BrutalFactsSummary from "../../components/BrutalFacts/BrutalFactsSummary";
import BrutalFactsChart from "../../components/BrutalFacts/BrutalFactsChart";
import BrutalFactsEqualizationList from "../../components/BrutalFacts/BrutalFactsEqualizationList";
import { fetchMentorMentees } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/api";

const BrutalFacts: React.FC = () => {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<any[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<any | null>(null);
  const [hasClosedCycle, setHasClosedCycle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchMentorMentees(user.id)
      .then(setMentees)
      .catch(() => setMentees([]));
  }, [user]);

  useEffect(() => {
    if (!selectedMentee) return;
    setLoading(true);
    const fetchCycle = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/ciclos/brutal-facts?userId=${selectedMentee.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Erro ao buscar ciclo");
        const data = await res.json();
        setHasClosedCycle(!!data.cycleName);
      } catch {
        setHasClosedCycle(false);
      } finally {
        setLoading(false);
      }
    };
    fetchCycle();
  }, [selectedMentee]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-8">
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Selecione um mentorado:
        </label>
        <select
          className="p-2 rounded border"
          value={selectedMentee?.id || ""}
          onChange={(e) => {
            const mentee = mentees.find((m) => m.id === Number(e.target.value));
            setSelectedMentee(mentee || null);
          }}
        >
          <option value="">-- Escolha --</option>
          {mentees.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      {!selectedMentee || loading || hasClosedCycle === null ? (
        <div className="w-full max-w-4xl mb-2">
          <div className="bg-gray-100 border border-gray-200 text-gray-600 rounded-lg p-4 text-center text-sm font-medium">
            {selectedMentee
              ? "Carregando informações do ciclo..."
              : "Selecione um mentorado para visualizar os dados."}
          </div>
        </div>
      ) : !hasClosedCycle ? (
        <div className="w-full max-w-4xl mb-2">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-center text-base font-semibold">
            Os dados de Brutal Facts só aparecerão quando houver pelo menos um
            ciclo finalizado para este colaborador.
          </div>
        </div>
      ) : (
        <>
          <Metricas userId={selectedMentee.id} />
          <BrutalFactsSummary userId={selectedMentee.id} />
          <BrutalFactsChart userId={selectedMentee.id} />
          <BrutalFactsEqualizationList userId={selectedMentee.id} />
        </>
      )}
    </div>
  );
};

export default BrutalFacts;
