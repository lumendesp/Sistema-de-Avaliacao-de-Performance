import React, { useState } from 'react';
import { mockCollaborators } from '../../../data/rh_data';
import RHCollaboratorInfoCard from '../../../components/RH/RHCollaboratorInfoCard/RHCollaboratorInfoCard';
import RHCollaboratorSearchBar from '../../../components/RH/RHCollaboratorSearchBar/RHCollaboratorSearchBar';
import { IoFunnel } from "react-icons/io5";

const RHCollaboratorsPage: React.FC = () => {

    const [searchTerm, setSearchTerm] = useState('');

    const filteredCollaborators = mockCollaborators.filter(collaborator =>
        collaborator.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Colaboradores</h1>

            {/* 3. A toolbar com a busca e o filtro, como no Figma */}
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


            {/* 4. A lista é renderizada com base nos resultados filtrados */}
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