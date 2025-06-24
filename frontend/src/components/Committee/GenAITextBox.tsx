import AIIcon from '../../assets/committee/AI-icon.png';

function GenAITextBox() {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 border-l-[#08605F] pl-6">
            <div className="flex items-center gap-2 mb-4">
                <img 
                    src={AIIcon}
                    alt="Ícone IA"
                    className="w-5 h-5"
                />
                <span className="text-sm font-semibold text-gray-700">Resumo</span>
            </div>
            <textarea 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F] mb-4"
                rows={3}
                placeholder="Aguardando implementação do Resumo GenAI"
                disabled
            />
        </div>
    );
}

export default GenAITextBox;
