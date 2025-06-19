import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import InfoCard from "../../components/Committee/CommitteeHome/InfoCard";
import CircularProgress from "../../components/Committee/CirculaProgress";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import persons from "../../assets/committee/two-persons.png";
import { UserIcon } from '../../components/UserIcon';
import { getUsersWithEvaluations } from '../../services/api';

interface Collaborator {
    id: number;
    name: string;
    role: string;
    initials: string;
    state: 'pendente' | 'finalizado' | 'expirado';
    autoAvaliacao: number;
    avaliacao360: number;
    notaGestor: number;
    notaFinal?: number;
}

function Committee(){
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

    const fetchCollaborators = async () => {
        try {
            const users = await getUsersWithEvaluations();
            const formattedCollaborators = users.map((user: any) => {
                const evaluations = user.evaluationsEvaluated || [];
                
                const getScore = (type: string): number => {
                    const evalData = evaluations.find((e: any) => e.type === type);
                    return evalData ? evalData.score : 0;
                };

                const finalEval = evaluations.find((e: any) => e.type === 'FINAL');

                return {
                    id: user.id,
                    name: user.name,
                    role: user.roles.map((r: any) => r.role.type).join(', ') || 'N/A',
                    initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                    state: finalEval?.status === 'FINALIZED' ? 'finalizado' : 'pendente',
                    autoAvaliacao: getScore('SELF'),
                    avaliacao360: getScore('PEER'),
                    notaGestor: getScore('MANAGER'),
                    notaFinal: finalEval ? finalEval.score : undefined,
                };
            });
            setCollaborators(formattedCollaborators);
        } catch (error) {
            console.error("Failed to fetch collaborators:", error);
        }
    };

    useEffect(() => {
        fetchCollaborators();
    }, []);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = collaborators.length;
        const finalized = collaborators.filter(c => c.state === 'finalizado').length;
        const pending = collaborators.filter(c => c.state === 'pendente').length;
        const percentage = total > 0 ? Math.round((finalized / total) * 100) : 0;
        
        return { total, finalized, pending, percentage };
    }, [collaborators]);

    return(
        <div className="w-full h-screen bg-gray-300">
            <div className="flex justify-between items-center p-5">
                <h1 className="text-2xl">
                    <span className="font-bold">Olá,</span> comite
                </h1>
                <UserIcon initials="CN" size={40} />
            </div>

            <div className="flex justify-between items-center gap-x-3 m-5"> {/* //parte de dashboard onde fica prazo preechimento e equalizações */}
                <InfoCard name="Prazo" description="Faltam 30 dias para o fechamento das notas, no dia 30/08/2025" number={30} subName="dias" />
                <InfoCard name="Preechimento de avaliação" description="Quantidade de colaboradores que já fecharam as suas avaliações">
                    <CircularProgress percentage={stats.percentage} />
                </InfoCard>
                <Link to="/committee/equalization">
                    <InfoCard 
                        name="Equalizações pendentes" 
                        description="Conclua suas revisoes de nota" 
                        image={persons} 
                        number={stats.pending} 
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
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {collaborators.slice(0, 5).map((collab) => (
                        <Colaborators 
                            key={collab.id}
                            name={collab.name} 
                            role={collab.role} 
                            initials={collab.initials} 
                            state={collab.state}
                            autoAvaliacao={collab.autoAvaliacao}
                            avaliacao360={collab.avaliacao360}
                            notaGestor={collab.notaGestor}
                            notaFinal={collab.notaFinal}
                        />
                    ))}
                    {collaborators.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            Nenhum colaborador encontrado
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Committee;

