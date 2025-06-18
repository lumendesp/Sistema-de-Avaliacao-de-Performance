import StarRating from "../StarRating";

interface CriterionProps {
    name: string;
    score: number;
}

const Criterion = ({ name, score }: CriterionProps) => {
    const getColorClass = (score: number) => {
        if (score >= 4) return 'text-green-600';
        if (score >= 3) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getBarColorClass = (score: number) => {
        if (score >= 4) return 'bg-green-600';
        if (score >= 3) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    return (
        <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{name}</span>
                <span className={`text-sm font-bold ${getColorClass(score)}`}>
                    {score.toFixed(1)}
                </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                    className={`h-full rounded-full ${getBarColorClass(score)}`}
                    style={{ width: `${(score / 5) * 100}%` }}
                />
            </div>
        </div>
    );
};

interface EvaluationSummaryProps {
    autoAvaliacao: number;
    avaliacao360: number;
    notaGestor: number;
    notaFinal?: number;
    onEdit?: () => void;
    onDownload?: () => void;
}

function EvaluationSummary({ 
    autoAvaliacao, 
    avaliacao360, 
    notaGestor, 
    notaFinal,
    onEdit,
    onDownload
}: EvaluationSummaryProps) {
    
    console.log("🚀 Evaluation Props:", {
        autoAvaliacao,
        avaliacao360,
        notaGestor,
        notaFinal
      });
      
      const hasAllGrades =
        typeof autoAvaliacao === 'number' &&
        typeof avaliacao360 === 'number' &&
        typeof notaGestor === 'number' &&
        typeof notaFinal === 'number';
      
      console.log("✅ hasAllGrades:", hasAllGrades);
      
  

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <Criterion name="Autoavaliação" score={autoAvaliacao} />
                <Criterion name="Nota Gestor" score={notaGestor} />
                <Criterion name="Avaliação 360" score={avaliacao360} />
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-[#08605F]" />
                    <span className="text-sm font-semibold text-gray-700">Resumo</span>
                </div>
                <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] mb-4"
                    rows={3}
                    placeholder="Legal Summary"
                />
                <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                        className="h-full rounded-full bg-[#08605F]"
                        style={{ width: `${(notaFinal ? notaFinal : 0) / 5 * 100}%` }}
                    />
                </div>
            </div>

            {!hasAllGrades ? (
                <>
                    <div>
                        <h3 className="text-sm font-semibold mb-2">Dê uma avaliação de 1 à 5</h3>
                        <StarRating 
                            score={0} 
                            onChange={() => {}} 
                        />
                    </div>
                    
                    <div>
                        <h3 className="text-sm font-semibold mb-2">Justifique sua nota</h3>
                        <textarea 
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F]"
                            rows={4}
                            placeholder="Justifique sua nota"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            className="px-4 py-2 bg-[#08605F] text-white rounded-md hover:bg-[#064a49] transition-colors"
                        >
                            Concluir
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onDownload}
                        className="px-4 py-2 text-[#08605F] border border-[#08605F] rounded-md hover:bg-[#08605F] hover:text-white transition-colors"
                    >
                        Baixar Avaliação
                    </button>
                    <button 
                        onClick={onEdit}
                        className="px-4 py-2 bg-[#08605F] text-white rounded-md hover:bg-[#064a49] transition-colors"
                    >
                        Editar Avaliação
                    </button>
                </div>
            )}
        </div>
    );
}

export default EvaluationSummary; 