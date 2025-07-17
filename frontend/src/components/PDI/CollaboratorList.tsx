import React from 'react';
import type { PDICollaborator } from './types';

interface CollaboratorListProps {
  collaborators: PDICollaborator[];
  selectedCollaborator: string | null;
  onSelectCollaborator: (id: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  collaborators,
  selectedCollaborator,
  onSelectCollaborator,
  filter,
  onFilterChange,
}) => {
  const filteredCollaborators = collaborators.filter(collab => 
    collab.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="w-full">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Colaboradores</h2>
      {/* Filtro de busca por nome */}
      <input
        type="text"
        placeholder="Buscar colaborador..."
        className="border rounded px-3 py-2 w-full mb-4 text-sm sm:text-base"
        value={filter}
        onChange={e => onFilterChange(e.target.value)}
      />
      <div className="space-y-2">
        {filter.trim() !== '' ? (
          filteredCollaborators.map((collab) => (
            <button
              key={collab.id}
              onClick={() => onSelectCollaborator(collab.id)}
              className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-colors ${
                selectedCollaborator === collab.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm sm:text-base">
                  {collab.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{collab.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{collab.position}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {collab.actions.length} {collab.actions.length === 1 ? 'ação' : 'ações'}
              </div>
            </button>
          ))
        ) : null}
        {filter.trim() !== '' && filteredCollaborators.length === 0 && (
          <div className="text-gray-400 px-2 py-4">Nenhum colaborador encontrado</div>
        )}
      </div>
    </div>
  );
};

export default CollaboratorList; 