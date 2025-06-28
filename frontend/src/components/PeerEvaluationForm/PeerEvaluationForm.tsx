import ScoreBox from "../ScoreBox";
import StarRating from "../StarRating";

import { UserIcon } from "../UserIcon";
import { FaTrash } from "react-icons/fa";

import { useState } from "react";
import Select from "react-select";

type MotivationOption = {
  value: string;
  label: string;
};

const PeerEvaluationForm = () => {
  const [score, setScore] = useState<number | undefined>(undefined);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectPeriod, setProjectPeriod] = useState("");
  const [motivation, setMotivation] = useState<MotivationOption | null>(null);

  const motivationOptions: MotivationOption[] = [
    { value: "CONCORDO_TOTALMENTE", label: "Concordo Totalmente" },
    { value: "CONCORDO_PARCIALMENTE", label: "Concordo Parcialmente" },
    { value: "DISCORDO_PARCIALMENTE", label: "Discordo Parcialmente" },
    { value: "DISCORDO_TOTALMENTE", label: "Discordo Totalmente" },
  ];

  return (
    <div className="bg-white w-full flex flex-col px-6 py-9 rounded-xl">
      <div className="flex justify-between items-center mb-5">
        <div className="flex justify-center items-center gap-3">
          <UserIcon initials="CN" size={40} />
          <div className="flex flex-col">
            <p className="text-sm font-bold ">Colaborador 1</p>
            <p className="text-xs font-normal text-opacity-75 text-[#1D1D1D]">
              Product Design
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <ScoreBox score={score} />
          <FaTrash className="text-[#F33E3E]" />
        </div>
      </div>
      <div className="flex flex-col mb-4 gap-3">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Dê uma avaliação de 1 a 5 ao colaborador
        </p>
        <div>
          <StarRating score={score ?? 0} onChange={setScore} />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Pontos fortes
          </p>
          <textarea
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
            name=""
            id=""
            placeholder="Justifique sua nota..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
          ></textarea>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Pontos de melhoria
          </p>
          <textarea
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
            name=""
            id=""
            placeholder="Justifique sua nota..."
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Projeto em que atuaram juntos (obrigatório terem atuado juntos)
          </p>
          <input
            type="text"
            className="w-full h-9 p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
            placeholder="Nome do Projeto"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Período (em meses)
          </p>
          <input
            type="text"
            className="w-full h-9 p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
            placeholder="Insira apenas o número de meses"
            value={projectPeriod}
            onChange={(e) => setProjectPeriod(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Você ficaria motivado em trabalhar novamente com este colaborador?
          </p>
          <Select
            options={motivationOptions}
            value={motivation}
            onChange={(selected) => setMotivation(selected || null)}
            placeholder="Selecione uma opção"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "36px",
                height: "36px",
                borderRadius: "0.25rem",
                borderColor: state.isFocused ? "#08605e4a" : "#ccc",
                boxShadow: "none",
                outline: state.isFocused ? "1px solid #08605e4a" : "none",
                fontSize: "12px",
                padding: 0,
                "&:hover": {
                  borderColor: state.isFocused ? "#08605e4a" : "#ccc",
                  boxShadow: "none",
                  outline: state.isFocused ? "1px solid #08605e4a" : "none",
                },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#08605e4a" : "white", 
                color: "#1D1D1D",
                cursor: "pointer",
                ":active": {
                  backgroundColor: "#08605e4a",
                },
              }),
              valueContainer: (base) => ({
                ...base,
                padding: "0 8px",
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: "36px",
              }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PeerEvaluationForm;
