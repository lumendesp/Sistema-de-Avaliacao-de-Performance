import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getUsersWithEvaluationsForCommittee, fetchActiveEvaluationCycle } from '../../services/api';
import { exportEvaluationToExcel, exportEvaluationToCSV, transformBackendDataToExport } from '../../services/export.service';
import InfoCard from "../../components/Committee/CommitteeHome/InfoCard";
import CircularProgress from "../../components/Committee/CirculaProgress";
import Colaborators from "../../components/Committee/ColaboratorsCommittee";
import persons from "../../assets/committee/two-persons.png";
import { UserIcon } from '../../components/UserIcon';
import { useAuth } from '../../context/AuthContext';
import { IoIosSearch } from 'react-icons/io';

interface Collaborator {
    id: number;
    name: string;
    role: string;
    initials: string;
    state: 'pendente' | 'finalizado' | 'expirado';
    autoAvaliacao: number;
    avaliacao360: number;
    notaMentor: number;
    notaGestor: number;
    notaFinal?: number;
    hasAllEvaluations?: boolean;
}

function Committee(){
    const { user } = useAuth();
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [fullUserData, setFullUserData] = useState<any[]>([]);
    const [cycle, setCycle] = useState<any>(null);
    const [remainingDays, setRemainingDays] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCollaborators = async () => {
        try {
            const users = await getUsersWithEvaluationsForCommittee();
            setFullUserData(users); // Store full data for export
            
            const formattedCollaborators = users.map((user: any) => {
                const evaluations = user.evaluationsEvaluated || [];
                
                const getScore = (type: string): number => {
                    const evalData = evaluations.find((e: any) => e.type === type);
                    return evalData ? evalData.score : 0;
                };

                const finalEval = evaluations.find((e: any) => e.type === 'FINAL');

                // Determine state based on having all 4 required evaluation types
                const requiredTypes = ['SELF', 'PEER', 'MENTOR', 'MANAGER', 'FINAL'];
                const typesPresent = evaluations.map((e: any) => e.type);
                const hasAllEvaluations = requiredTypes.every(type => typesPresent.includes(type));
                const state = hasAllEvaluations ? 'finalizado' : 'pendente';


                return {
                    id: user.id,
                    name: user.name,
                    role: user.roles.map((r: any) => r.role).join(', ') || 'N/A',
                    initials: user.name.split(' ').map((n: string) => n[0]).join(''),
                    state: state,
                    autoAvaliacao: getScore('SELF'),
                    avaliacao360: getScore('PEER'),
                    notaMentor: getScore('MENTOR'),
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

    const fetchCycle = async () => {
        try {
            const data = await fetchActiveEvaluationCycle();
            setCycle(data);
            if (data && data.endDate) {
                const endDate = new Date(data.endDate);
                const today = new Date();
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setRemainingDays(Math.max(0, diffDays));
            }
        } catch (e) {
            setCycle(null);
            setRemainingDays(null);
        }
    };

    useEffect(() => {
        fetchCollaborators();
        fetchCycle();
    }, []);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = collaborators.length;
        const finalized = collaborators.filter(c => c.state === 'finalizado').length;
        const pending = collaborators.filter(c => c.state === 'pendente').length;
        const percentage = total > 0 ? Math.round((finalized / total) * 100) : 0;
        
        return { total, finalized, pending, percentage };
    }, [collaborators]);

    // Filtered collaborators for search
    const filteredCollaborators = useMemo(() => {
        if (!searchTerm) return collaborators;
        return collaborators.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [collaborators, searchTerm]);

    return(
        <div className="w-full min-h-screen bg-[#f1f1f1]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 gap-4">
                <h1 className="text-xl sm:text-2xl">
                    <span className="font-bold">Olá,</span> {user?.name || 'usuário'}
                </h1>
                <div className="flex items-center gap-4">
                    <UserIcon initials={user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CN'} size={40} />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 m-4 sm:m-5">
                <InfoCard 
                    name={cycle ? cycle.name : 'Prazo'} 
                    description={cycle && remainingDays !== null ?
                        `Faltam ${remainingDays} dias para o fechamento das notas, de ${new Date(cycle.startDate).toLocaleDateString()} até ${new Date(cycle.endDate).toLocaleDateString()}` :
                        'Não há ciclo ativo no momento.'}
                    number={remainingDays !== null ? remainingDays : 0} 
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
                {/* Search bar */}
                <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white mb-4">
                    <IoIosSearch size={16} className="text-[#1D1D1D]/75" />
                    <input
                        type="text"
                        placeholder="Buscar por colaboradores"
                        className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {filteredCollaborators.slice(0, 5).map((collab) => {
                        console.log('Colab:', collab);
                        return (
                            <Colaborators 
                                key={collab.id}
                                name={collab.name} 
                                role={collab.role} 
                                initials={collab.initials} 
                                state={collab.state}
                                autoAvaliacao={collab.autoAvaliacao}
                                avaliacao360={collab.avaliacao360}
                                notaMentor={collab.notaMentor}
                                notaGestor={collab.notaGestor}
                                notaFinal={collab.notaFinal}
                            />
                        );
                    })}
                    {filteredCollaborators.length === 0 && (
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

