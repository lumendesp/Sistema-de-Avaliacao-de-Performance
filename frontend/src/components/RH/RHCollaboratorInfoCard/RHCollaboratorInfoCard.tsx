import React from 'react';
import { type RhCollaborator } from '../../../services/rhApiService';
import StatusBadge from '../StatusBadge/StatusBadge';
import AssessmentPreview from '../AssessmentPreview/AssessmentPreview';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface RHCollaboratorInfoCardProps {
    collaborator: RhCollaborator;
}

const RHCollaboratorInfoCard: React.FC<RHCollaboratorInfoCardProps> = ({ collaborator }) => {
    const { name, role, avatarInitials, status, ...scores } = collaborator;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer">
            {/* Informações do Colaborador */}
            <div className="flex items-center gap-x-4">
                <div className="w-12 h-12 bg-gray-200 text-gray-600 font-bold rounded-full flex items-center justify-center text-lg">
                    {avatarInitials}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{name}</p>
                    <p className="text-sm text-gray-500">{role}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Prévia das Avaliações */}
            <div className="hidden lg:flex"> {/* Esconde em telas pequenas para não quebrar o layout */}
                <AssessmentPreview scores={scores} />
            </div>

            {/* Ícone de Ação */}
            <div>
                <ChevronRightIcon className="h-6 w-6 text-gray-400" />
            </div>
        </div>
    );
};

export default RHCollaboratorInfoCard;