import React, { useState, useEffect } from 'react';
import { getRhCollaborators } from '../../../services/api';
import { type RhCollaborator } from '../../../types/rh';
import RHCollaboratorInfoCard from '../../../components/RH/RHCollaboratorInfoCard/RHCollaboratorInfoCard';
/* import RHCollaboratorSearchBar from '../../../components/RH/RHCollaboratorSearchBar/RHCollaboratorSearchBar'; */
import { IoIosSearch } from "react-icons/io";

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

const RHCollaboratorsPage: React.FC = () => {

    const [collaborators, setCollaborators] = useState<RhCollaborator[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 250);

    useEffect(() => {
        const fetchData = async () => {
            if (!initialLoading) {
                setIsSearching(true);
            }

            try {
                const data = await getRhCollaborators(undefined, debouncedSearchTerm);
                setCollaborators(data);
            } catch (err) {
                setError('Falha ao carregar a lista de colaboradores.');
                console.error(err);
            } finally {
                setInitialLoading(false);
                setIsSearching(false);
            }
        };

        fetchData();
    }, [debouncedSearchTerm]);

    if (initialLoading) {
        return <div className="p-8 text-center text-gray-500">Carregando colaboradores...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Colaboradores</h1>

            <div className="flex items-center justify-between mb-6">
                <div className="w-full relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IoIosSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}>
                {collaborators.length > 0 ? (
                    collaborators.map(collaborator => (
                        <RHCollaboratorInfoCard key={collaborator.id} collaborator={collaborator} />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-600">
                            {searchTerm ? `Nenhum colaborador encontrado para "${searchTerm}".` : "Nenhum colaborador encontrado."}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default RHCollaboratorsPage;