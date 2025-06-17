import InfoCard from "../components/InfoCard";
import Colaborators from "../components/ColaboratorsCommittee";
import calendar from "../assets/committee/calendar.png";
import persons from "../assets/committee/two-persons.png";  

function Committee(){
    return(
        <div className="flex w-full h-screen">
            <div className="w-[15%] bg-white-200"> {/* //navbar ao lado */}
                <h1>Nav bar ao lado</h1>
            </div>
            <div className="w-[85%] bg-gray-300">
                <div className="flex justify-between items-center p-5"> {/* // parte superior onde fica a msg de ola e botao de usuario */}
                    <h1 className="text-2xl font-bold">Olá, comite</h1>
                    <button className="w-10 h-10 bg-gray-400 text-green-300 rounded-full flex items-center justify-center">
                        CN
                    </button>
                </div>
                <div className="flex justify-between items-center gap-x-3 m-5"> {/* //parte de dashboard onde fica prazo preechimento e equalizações */}
                    <InfoCard name="Prazo de preechimento" description="Prazo de preechimento em 30 dias" image={calendar} number={10} subName="dias" />
                    <InfoCard name="Equalizações" description="Equalizações em 30 dias" image={persons} number={10} subName="dias" />
                    <InfoCard name="Prazo de equalizações" description="Prazo de equalizações em 30 dias" image={persons} number={10} subName="dias" />
                </div>

                {/* all menbers */ }
                <div className="bg-white rounded-lg shadow-md m-5 p-4"> {/* //parte de tabela onde fica os usarios e suas notas e status*/ }
                    <div className="flex justify-between items-center mb-4 p-5">
                        <h1 className="text-xl font-semibold text-gray-800">Resumo de equalizações</h1>
                        <button className="text-green-500 hover:text-green-600 font-medium">ver mais</button>
                    </div>
                    <div>
                        <Colaborators/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Committee;

