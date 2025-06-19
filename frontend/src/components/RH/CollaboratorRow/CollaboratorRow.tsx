import StatusBadge from '../StatusBadge/StatusBadge';
import { type Collaborator } from '../../../types/evaluations';

interface CollaboratorRowProps {
    collaborator: Collaborator;
}

// Componente interno para a linha do colaborador, para manter a página limpa
const CollaboratorRow = ({ collaborator }: CollaboratorRowProps) => (
    <div className="flex items-center p-3 rounded-lg hover:bg-gray-50">
        <div className="w-10 h-10 bg-gray-200 text-gray-600 font-bold rounded-full flex items-center justify-center mr-4">
            {collaborator.avatarInitials}
        </div>
        <div className="flex-1">
            <p className="font-semibold text-sm text-gray-800">{collaborator.name}</p>
            <p className="text-xs text-gray-500">{collaborator.role}</p>
        </div>
        <StatusBadge status={collaborator.status} />
    </div>
);

export default CollaboratorRow;