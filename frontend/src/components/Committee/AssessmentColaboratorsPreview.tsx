interface AssessmentColaboratorsPreviewProps {
    autoAvaliacao?: number;
    avaliacao360?: number;
    notaGestor?: number;
    notaMentor?: number;
    notaFinal?: number;
}

function AssessmentColaboratorsPreview({
    autoAvaliacao,
    avaliacao360,
    notaGestor,
    notaMentor,
    notaFinal
}: AssessmentColaboratorsPreviewProps) {
    return (
        <div className="flex w-full justify-between items-center gap-2 sm:gap-4">
            {/* Autoavaliação */}
            <div className="flex-1 flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Autoavaliação</span>
                <div className="w-full max-w-[60px] h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                        {autoAvaliacao?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Avaliação 360 */}
            <div className="flex-1 flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Avaliação&nbsp;360</span>
                <div className="w-full max-w-[60px] h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                        {avaliacao360?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Nota Mentor */}
            <div className="flex-1 flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Nota&nbsp;Mentor</span>
                <div className="w-full max-w-[60px] h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                        {notaMentor?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Nota Gestor */}
            <div className="flex-1 flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Nota&nbsp;Gestor</span>
                <div className="w-full max-w-[60px] h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                        {notaGestor?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Nota Final */}
            <div className="flex-1 flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Nota&nbsp;Final</span>
                <div className={`w-full max-w-[60px] h-8 rounded flex items-center justify-center ${
                    notaFinal ? 'bg-[#08605F]' : 'bg-gray-100'
                }`}>
                    <span className={`text-xs sm:text-sm font-medium ${
                        notaFinal ? 'text-white' : 'text-gray-800'
                    }`}>
                        {notaFinal?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default AssessmentColaboratorsPreview;