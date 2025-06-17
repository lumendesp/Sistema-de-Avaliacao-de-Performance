import State from "../components/StatesCommittee"
import Assessment from "../components/AssessmentColaboratorsPreview"

function ColaboratorsCommitte(){
    return(
        <div className="border border-gray-300 rounded-md bg-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-x-4">
                <button className="w-10 h-10 bg-gray-400 text-black-300 rounded-full flex items-center justify-center">
                    CN
                </button>
                <div>
                    <h3>Colaborador 1</h3>
                    <h4 className="text-gray-500 text-sm">Product Desing</h4>
                </div>
                {/* componente de estados*/}
                <State state = "finalizado"/>
            </div>
            <div>
                {/* aqui fica o componente de cada colaborador*/}
                <Assessment />
            </div>
        </div>
    )
};

export default ColaboratorsCommitte;