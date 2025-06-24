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
        <div className="flex gap-4">
            {/* Autoavaliação */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Autoavaliação</span>
                <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-800 font-medium">
                        {autoAvaliacao?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Avaliação 360 */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Avaliação 360</span>
                <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-800 font-medium">
                        {avaliacao360?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Nota Gestor */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Nota Gestor</span>
                <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-800 font-medium">
                        {notaGestor?.toFixed(1) || '-'}
                    </span>
                </div>
            </div>

            {/* Nota Final */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Nota Final</span>
                <div className={`w-16 h-8 rounded flex items-center justify-center ${
                    notaFinal ? 'bg-[#08605F]' : 'bg-gray-100'
                }`}>
                    <span className={`font-medium ${
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