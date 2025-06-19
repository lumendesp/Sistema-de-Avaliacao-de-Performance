import React from 'react';
import { mockCollaborators } from '../../../data/rh_data';
import RHCollaboratorInfoCard from '../../../components/RH/RHCollaboratorInfoCard/RHCollaboratorInfoCard';

const RHCollaboratorsPage: React.FC = () => {
    return (
        <div className="w-full min-h-screen bg-gray-100 p-8 font-sans">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Colaboradores</h1>

            {/* Lista de Colaboradores */}
            <div className="flex flex-col gap-4">
                {mockCollaborators.map(collaborator => (
                    <RHCollaboratorInfoCard key={collaborator.id} collaborator={collaborator} />
                ))}
            </div>
        </div>
    );
};

export default RHCollaboratorsPage;