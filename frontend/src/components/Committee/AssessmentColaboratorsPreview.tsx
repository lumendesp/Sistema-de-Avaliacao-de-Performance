interface AssessmentColaboratorsPreviewProps {
    autoAvaliacao?: number;
    avaliacao360?: number;
    notaGestor?: number;
    notaFinal?: number;
}

function AssessmentColaboratorsPreview({
    autoAvaliacao,
    avaliacao360,
    notaGestor,
    notaFinal
}: AssessmentColaboratorsPreviewProps) {
    return (
        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start">
            {/* Autoavaliação */}
            <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Autoavaliação</span>
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                        {autoAvaliacao?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Avaliação 360 */}
            <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Avaliação 360</span>
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                        {avaliacao360?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Nota Gestor */}
            <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Nota Gestor</span>
                <div className="w-12 sm:w-16 h-6 sm:h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs sm:text-sm text-gray-800 font-medium">
                        {notaGestor?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Nota Final */}
            <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Nota Final</span>
                <div className={`w-12 sm:w-16 h-6 sm:h-8 rounded flex items-center justify-center ${
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