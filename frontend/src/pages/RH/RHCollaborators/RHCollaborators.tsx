import React, { useState, useEffect } from 'react';
import { getRhCollaborators, type RhCollaborator } from '../../../services/rhApiService';
import RHCollaboratorInfoCard from '../../../components/RH/RHCollaboratorInfoCard/RHCollaboratorInfoCard';
import RHCollaboratorSearchBar from '../../../components/RH/RHCollaboratorSearchBar/RHCollaboratorSearchBar';
import { IoFunnel } from "react-icons/io5";

const RHCollaboratorsPage: React.FC = () => {

    const [collaborators, setCollaborators] = useState<RhCollaborator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRhCollaborators();
                setCollaborators(data);
            } catch (err) {
                setError('Falha ao carregar a lista de colaboradores.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredCollaborators = collaborators.filter(collaborator =>
        collaborator.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Carregando colaboradores...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Colaboradores</h1>

            <div className="flex items-center justify-between mb-6">
                <div className="w-full max-w-sm">
                    <RHCollaboratorSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                </div>
                <button className="bg-[#08605F] p-3 rounded-md text-white">
                    <IoFunnel size={24} />
                </button>
            </div>


            <div className="flex flex-col gap-4">
                {filteredCollaborators.length > 0 ? (
                    filteredCollaborators.map(collaborator => (
                        <RHCollaboratorInfoCard key={collaborator.id} collaborator={collaborator} />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600">Nenhum colaborador encontrado para sua busca.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default RHCollaboratorsPage;