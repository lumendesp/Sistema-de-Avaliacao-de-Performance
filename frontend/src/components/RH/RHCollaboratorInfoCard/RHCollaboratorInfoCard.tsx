import React, { useState } from 'react';
import { type RhCollaborator } from '../../../types/rh';
import StatusBadge from '../StatusBadge/StatusBadge';
import AssessmentPreview from '../AssessmentPreview/AssessmentPreview';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface RHCollaboratorInfoCardProps {
    collaborator: RhCollaborator;
}

const RHCollaboratorInfoCard: React.FC<RHCollaboratorInfoCardProps> = ({ collaborator }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { name, role, avatarInitials, status, ...scores } = collaborator;

    const handleToggleExpand = () => {
        // Verifica a largura da tela para não executar a ação no desktop
        if (window.innerWidth < 1024) { // 1024px é o breakpoint 'lg' do Tailwind
            setIsExpanded(prev => !prev);
        }
    };

    const scoreItems = [
        { label: 'Autoavaliação', value: scores.autoAvaliacao },
        { label: 'Avaliação 360', value: scores.avaliacao360 },
        { label: 'Nota Mentor', value: scores.notaMentor },
        { label: 'Nota Gestor', value: scores.notaGestor },
        { label: 'Nota Final', value: scores.notaFinal },
    ];

    return (
        <div
            onClick={handleToggleExpand}
            className="bg-white p-4 rounded-xl shadow-sm border border-transparent flex flex-wrap items-center justify-between 
                       transition-all duration-200 
                       md:border-gray-200 
                       md:hover:shadow-sm md:hover:border-gray-200 md:cursor-default">
            {/* Informações do Colaborador */}
            <div className="flex items-center gap-x-4">
                <div className="w-12 h-12 bg-gray-200 text-gray-600 font-bold rounded-full flex items-center justify-center text-lg">
                    {avatarInitials}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">
                        {name.length > 6 ? `${name.substring(0, 6)}...` : name}
                    </p>
                    <p className="text-sm text-gray-500">{role}</p>
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Prévia das Avaliações */}
            <div className="hidden lg:flex flex-shrink-0">
                <AssessmentPreview scores={scores} />
            </div>

            {/* Ícone de Ação */}
            <div className="ml-4">
                <ChevronRightIcon 
                    className={`h-6 w-6 text-gray-400 transition-transform duration-200 lg:hidden ${isExpanded ? 'rotate-90' : ''}`} 
                />
            </div>

            {isExpanded && (
                <div className="w-full mt-4 pt-4 border-t border-gray-100 lg:hidden">
                    <div className="space-y-2">
                        {scoreItems.map(item => (
                            <div key={item.label} className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">{item.label}</span>
                                <span className="font-bold text-gray-800">
                                    {typeof item.value === 'number' ? item.value.toFixed(1) : '-'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default RHCollaboratorInfoCard;