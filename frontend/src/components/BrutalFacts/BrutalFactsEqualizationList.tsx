import React, { useEffect, useState } from 'react';
import { API_URL } from '../../services/api';
import * as XLSX from 'xlsx';

interface Collaborator {
  nome: string;
  cargo: string;
  nota: string;
  autoNota?: string;
  managerNota?: string;
  peerNota?: string;
  finalNota?: string;
  mentorNota?: string;
}

const BrutalFactsEqualizationList: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [cycleName, setCycleName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/ciclos/brutal-facts`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar colaboradores');
        const data = await res.json();
        setColaboradores(data.collaborators || []);
        setCycleName(data.cycleName || '');
      } catch (err: any) {
        setColaboradores([]);
        setCycleName('');
      } finally {
        setLoading(false);
      }
    };
    fetchCollaborators();
  }, []);

  const filteredCollaborators = colaboradores.filter(colab =>
    colab.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colab.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredCollaborators.map(colab => ({
      Nome: colab.nome,
      Cargo: colab.cargo,
      'Nota Autoavaliação': colab.autoNota || '-',
      'Nota Gestor': colab.managerNota || '-',
      'Nota 360': colab.peerNota || '-',
      'Nota Final': colab.finalNota || '-',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores');
    // Limpa caracteres especiais do nome do ciclo para o nome do arquivo
    const cleanCycleName = cycleName ? cycleName.replace(/[^a-zA-Z0-9-_]/g, '_') : 'ciclo';
    XLSX.writeFile(workbook, `brutal-facts-colaboradores-${cleanCycleName}.xlsx`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-700">Resumo de equalizações</span>
        </div>
        <div className="h-40 flex items-center justify-center">
          <span className="text-gray-500">Carregando colaboradores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <span className="font-semibold text-gray-700">Resumo de equalizações</span>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Buscar por colaboradores"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={handleExport}
            className="bg-[#08605F] hover:bg-[#064a49] text-white px-3 py-1 rounded text-sm shadow"
          >
            Exportar Planilha
          </button>
        </div>
      </div>
      <div>
        {filteredCollaborators.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Nenhum colaborador encontrado.' : 'Nenhum colaborador avaliado no ciclo atual.'}
          </div>
        ) : (
          filteredCollaborators.map((colab, idx) => (
            <div key={idx} className="border-b py-3">
              {/* Header com nome e cargo */}
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                  {colab.nome.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-700 truncate">{colab.nome}</div>
                  <div className="text-xs text-gray-400 truncate">{colab.cargo}</div>
                </div>
              </div>
              
              {/* Grid de notas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 whitespace-nowrap mb-1">Autoavaliação</span>
                  <div className="w-full max-w-[50px] sm:max-w-[60px] h-7 sm:h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-800 font-medium">{colab.autoNota !== undefined && colab.autoNota !== '-' ? Number(colab.autoNota).toFixed(1) : '-'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 whitespace-nowrap mb-1">Avaliação 360</span>
                  <div className="w-full max-w-[50px] sm:max-w-[60px] h-7 sm:h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-800 font-medium">{colab.peerNota !== undefined && colab.peerNota !== '-' ? Number(colab.peerNota).toFixed(1) : '-'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 whitespace-nowrap mb-1">Nota Gestor</span>
                  <div className="w-full max-w-[50px] sm:max-w-[60px] h-7 sm:h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-800 font-medium">{colab.managerNota !== undefined && colab.managerNota !== '-' ? Number(colab.managerNota).toFixed(1) : '-'}</span>
                  </div>
                </div>
                {colab.mentorNota !== undefined && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-600 whitespace-nowrap mb-1">Nota Mentor</span>
                    <div className="w-full max-w-[50px] sm:max-w-[60px] h-7 sm:h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-800 font-medium">{colab.mentorNota !== '-' ? Number(colab.mentorNota).toFixed(1) : '-'}</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 whitespace-nowrap mb-1">Nota Final</span>
                  <div className={`w-full max-w-[50px] sm:max-w-[60px] h-7 sm:h-8 rounded flex items-center justify-center ${colab.finalNota && colab.finalNota !== '-' ? 'bg-[#08605F]' : 'bg-gray-100'}`}>
                    <span className={`text-xs font-medium ${colab.finalNota && colab.finalNota !== '-' ? 'text-white' : 'text-gray-800'}`}>{colab.finalNota !== undefined && colab.finalNota !== '-' ? Number(colab.finalNota).toFixed(1) : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrutalFactsEqualizationList; 