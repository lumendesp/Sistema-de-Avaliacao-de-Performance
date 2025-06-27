import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import InfoCard from "../../components/Committee/CommitteeHome/InfoCard";
import CircularProgress from "../../components/Committee/CirculaProgress";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import persons from "../../assets/committee/two-persons.png";
import { UserIcon } from '../../components/UserIcon';

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
    hasAllEvaluations?: boolean;
}

function Committee(){
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

    const fetchCollaborators = async () => {
        try {
            const formattedCollaborators = users.map((user: any) => {
                const evaluations = user.evaluationsEvaluated || [];
                
                const getScore = (type: string): number => {
                    const evalData = evaluations.find((e: any) => e.type === type);
                    return evalData ? evalData.score : 0;
                };

                const finalEval = evaluations.find((e: any) => e.type === 'FINAL');

                // Determine state based on having all 3 evaluations (PEER, MANAGER, FINAL)
                // Note: SELF evaluation is not in the current schema
                const hasAllEvaluations = user.hasAllEvaluations || evaluations.length >= 3;
                const state = hasAllEvaluations ? 'finalizado' : 'pendente';

                return {
                    id: user.id,
                    name: user.name,
                    role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
                    initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                    state: state,
                    autoAvaliacao: 0, // SELF evaluation not available in current schema
                    avaliacao360: getScore('PEER'),
                    notaGestor: getScore('MANAGER'),
                    notaFinal: finalEval ? finalEval.score : undefined,
                    hasAllEvaluations: hasAllEvaluations,
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

    // Calculate remaining days until July 12, 2025
    const getRemainingDays = () => {
        const deadline = new Date('2025-07-12');
        const today = new Date();
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const total = collaborators.length;
        const finalized = collaborators.filter(c => c.state === 'finalizado').length;
        const pending = collaborators.filter(c => c.state === 'pendente').length;
        const percentage = total > 0 ? Math.round((finalized / total) * 100) : 0;
        
        return { total, finalized, pending, percentage };
    }, [collaborators]);

    const remainingDays = getRemainingDays();

    return(
        <div className="w-full min-h-screen bg-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 gap-4">
                <h1 className="text-xl sm:text-2xl">
                    <span className="font-bold">Olá,</span> comite
                </h1>
                <UserIcon initials="CN" size={40} />
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 m-4 sm:m-5">
                <InfoCard 
                    name="Prazo" 
                    description={`Faltam ${remainingDays} dias para o fechamento das notas, no dia 12/07/2025`} 
                    number={remainingDays} 
                    subName="dias" 
                />
                <InfoCard name="Preechimento de avaliação" description="Quantidade de colaboradores que já fecharam as suas avaliações">
                    <CircularProgress percentage={stats.percentage} />
                </InfoCard>
                <Link to="/committee/equalizations" className="w-full lg:w-auto">
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

            {/* all members */}
            <div className="bg-white rounded-lg shadow-md m-4 sm:m-5 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 p-4 sm:p-5 gap-2">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Resumo de equalizações</h1>
                    <Link to="/committee/equalizations">
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

