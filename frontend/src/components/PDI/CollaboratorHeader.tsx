import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { PDICollaborator } from './types';

interface CollaboratorHeaderProps {
  collaborator: PDICollaborator;
  userRole: string;
  selectedCollaboratorPdis: any[];
  selectedCollaboratorPdiId: string | null;
  showPdiDropdown: boolean;
  setShowPdiDropdown: (show: boolean) => void;
  setSelectedCollaboratorPdiId: (id: string) => void;
  onNewAction: () => void;
  onNewPdi: () => void;
}

const CollaboratorHeader: React.FC<CollaboratorHeaderProps> = ({
  collaborator,
  userRole,
  selectedCollaboratorPdis,
  selectedCollaboratorPdiId,
  showPdiDropdown,
  setShowPdiDropdown,
  setSelectedCollaboratorPdiId,
  onNewAction,
  onNewPdi,
}) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg flex-shrink-0">
        {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="truncate">{collaborator.name}</span>
          {userRole === 'manager' && collaborator.pdiId && (
            <span className="text-gray-700 text-sm sm:text-base font-normal px-2 py-0.5">
              Plano: {selectedCollaboratorPdis.find(pdi => pdi.id.toString() === selectedCollaboratorPdiId)?.title || 'PDI Atual'}
            </span>
          )}
          {/* Dropdown de seleção de PDI do colaborador para manager */}
          {userRole === 'manager' && (
            <div className="relative inline-block sm:ml-2">
              <button
                className="text-sm text-green-700 border border-green-600 rounded px-2 py-1 hover:bg-green-50 transition-colors"
                onClick={() => setShowPdiDropdown(!showPdiDropdown)}
                type="button"
              >
                Mudar Plano
              </button>
              {showPdiDropdown && (
                <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg min-w-[180px]">
                  {selectedCollaboratorPdis.map((pdi) => (
                    <button
                      key={pdi.id}
                      onClick={() => {
                        setSelectedCollaboratorPdiId(pdi.id.toString());
                        setShowPdiDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-green-100 ${selectedCollaboratorPdiId === pdi.id.toString() ? 'bg-green-50 font-bold' : ''}`}
                    >
                      {pdi.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">{collaborator.position} • {collaborator.department}</p>
      </div>
      {/* Botão Nova Ação no mesmo nível do nome */}
      {(userRole === 'manager' || userRole === 'collaborator') && (
        <div className="flex-shrink-0">
          <button
            onClick={collaborator.pdiId ? onNewAction : onNewPdi}
            className={`bg-[#08605F] hover:bg-[#064a49] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base ${!collaborator.pdiId ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!collaborator.pdiId}
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Nova Ação
          </button>
        </div>
      )}
    </div>
  );
};

export default CollaboratorHeader; 