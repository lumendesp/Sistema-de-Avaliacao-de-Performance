import { Link } from 'react-router-dom';

import InfoCard from "../../components/Committee/CommitteeHome/InfoCard";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import calendar from "../../assets/committee/calendar.png";
import persons from "../../assets/committee/two-persons.png";
import { UserIcon } from '../../components/UserIcon';


function Committee(){
    return(
        <div className="flex w-full h-screen">
            <div className="w-[15%] bg-white-200"> {/* //navbar ao lado */}
                <h1>Nav bar ao lado</h1>
            </div>
            <div className="w-[85%] bg-gray-300">
                <div className="flex justify-between items-center p-5">
                    <h1 className="text-2xl">
                        <span className="font-bold">Olá,</span> comite
                    </h1>
                    <UserIcon initials="CN" size={40} />
                </div>

                <div className="flex justify-between items-center gap-x-3 m-5"> {/* //parte de dashboard onde fica prazo preechimento e equalizações */}
                    <InfoCard name="Prazo de preechimento" description="Prazo de preechimento em 30 dias" image={calendar} number={10} subName="dias" />
                    <InfoCard name="Equalizações" description="Equalizações em 30 dias" image={persons} number={10} subName="dias" />
                    <Link to="/committee/equalization">
                        <InfoCard 
                            name="Prazo de equalizações" 
                            description="Prazo de equalizações em 30 dias" 
                            image={persons} 
                            number={10} 
                            subName="dias" 
                            bgColor="green" 
                            textColor="white"
                            warningColor="white"
                        />
                    </Link>
                </div>

                {/* all menbers */ }
                <div className="bg-white rounded-lg shadow-md m-5 p-4"> {/* //parte de tabela onde fica os usarios e suas notas e status*/ }
                    <div className="flex justify-between items-center mb-4 p-5">
                        <h1 className="text-xl font-semibold text-gray-800">Resumo de equalizações</h1>
                        <Link to="/committee/equalization">
                            <button className="text-[#08605F] hover:text-green-700 font-medium">ver mais</button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <Colaborators name = "Diogo" role = "PO" initials="DH" state="expirado"/>
                        <Colaborators name = "Diogo" role = "PO" initials="DH" state="finalizado"/>
                        <Colaborators name = "Diogo" role = "PO" initials="DH" state="pendente"/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Committee;

