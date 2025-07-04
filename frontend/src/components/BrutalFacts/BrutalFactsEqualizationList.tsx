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
}

const BrutalFactsEqualizationList: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
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
      } catch (err: any) {
        setColaboradores([]);
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
    XLSX.writeFile(workbook, 'brutal-facts-colaboradores.xlsx');
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
    <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-700">Resumo de equalizações</span>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Buscar por colaboradores"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm shadow"
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
            <div key={idx} className="flex items-center justify-between border-b py-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-600">
                  {colab.nome.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-700">{colab.nome}</div>
                  <div className="text-xs text-gray-400">{colab.cargo}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Auto</span>
                  <span className="font-semibold text-blue-600">{colab.autoNota || '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Gestor</span>
                  <span className="font-semibold text-green-600">{colab.managerNota || '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">360</span>
                  <span className="font-semibold text-orange-600">{colab.peerNota || '-'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Final</span>
                  <span className="font-bold text-purple-600 text-lg">{colab.finalNota || '-'}</span>
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