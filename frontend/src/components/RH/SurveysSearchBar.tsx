import { IoIosSearch } from "react-icons/io";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Survey } from "../../types/survey";

interface SurveysSearchBarProps {
  onSelect?: (survey: Survey) => void;
}

const SurveysSearchBar = ({ onSelect }: SurveysSearchBarProps) => {
  const [search, setSearch] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const location = useLocation();

  useEffect(() => {
    setSearch("");
    setSurveys([]);
  }, [location.pathname]);

  useEffect(() => {
    if (!search.trim()) {
      setSurveys([]);
      return;
    }
  }, [search]);

  return (
    <div className="w-full relative">
      {/* barra de busca */}
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white/50">
        <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
        <input
          type="text"
          placeholder="Buscar por pesquisas"
          className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* dropdown com os resultados */}
      {search.trim() !== "" && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-md px-2 py-3 flex flex-col gap-2 z-10 max-h-60 overflow-auto">
          {surveys.length > 0 ? (
            surveys.map((survey) => (
              <div
                key={survey.id}
                className="flex flex-col p-2 rounded-md hover:bg-[#F1F5F9] cursor-pointer"
                onClick={() => {
                  onSelect?.(survey);
                  setSearch("");
                }}
              >
                <p className="text-sm font-bold text-[#1D1D1D]">
                  {survey.title}
                </p>
                <p className="text-xs font-normal text-[#1D1D1D]/75">
                  {survey.status === "aberta" ? "Aberta" : "Fechada"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#1D1D1D]/50 p-2">
              Nenhuma pesquisa encontrada.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveysSearchBar;
