import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface OKRItem {
  id: string;
  objective: string;
  keyResults: string[];
  progress: number;
  status: 'active' | 'completed' | 'overdue';
  dueDate: string;
}

interface OKRProps {
  userRole?: string;
  title?: string;
  description?: string;
}

const OKR: React.FC<OKRProps> = ({ 
  userRole = 'manager',
  title = 'OKR - Objetivos e Resultados-Chave',
  description = 'Defina e acompanhe seus objetivos estratégicos'
}) => {
  const [okrs, setOkrs] = useState<OKRItem[]>([
    {
      id: '1',
      objective: 'Aumentar a satisfação dos colaboradores em 20%',
      keyResults: [
        'Implementar programa de feedback mensal',
        'Realizar 4 pesquisas de clima organizacional',
        'Atingir score mínimo de 4.0/5.0'
      ],
      progress: 65,
      status: 'active',
      dueDate: '2024-12-31'
    },
    {
      id: '2',
      objective: 'Melhorar a eficiência dos processos de avaliação',
      keyResults: [
        'Reduzir tempo de avaliação em 30%',
        'Implementar automação em 3 processos',
        'Atingir 95% de aderência aos prazos'
      ],
      progress: 40,
      status: 'active',
      dueDate: '2024-11-30'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOKR, setNewOKR] = useState({
    objective: '',
    keyResults: [''],
    dueDate: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      case 'overdue':
        return 'Atrasado';
      default:
        return 'Desconhecido';
    }
  };

  const handleAddOKR = () => {
    if (newOKR.objective.trim() && newOKR.keyResults[0].trim()) {
      const okr: OKRItem = {
        id: Date.now().toString(),
        objective: newOKR.objective,
        keyResults: newOKR.keyResults.filter(kr => kr.trim()),
        progress: 0,
        status: 'active',
        dueDate: newOKR.dueDate
      };
      setOkrs([...okrs, okr]);
      setNewOKR({ objective: '', keyResults: [''], dueDate: '' });
      setShowAddForm(false);
    }
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    setOkrs(okrs.map(okr => 
      okr.id === id 
        ? { ...okr, progress, status: progress >= 100 ? 'completed' : 'active' }
        : okr
    ));
  };

  const handleDeleteOKR = (id: string) => {
    setOkrs(okrs.filter(okr => okr.id !== id));
  };

  const addKeyResult = () => {
    setNewOKR({
      ...newOKR,
      keyResults: [...newOKR.keyResults, '']
    });
  };

  const updateKeyResult = (index: number, value: string) => {
    const updatedKeyResults = [...newOKR.keyResults];
    updatedKeyResults[index] = value;
    setNewOKR({
      ...newOKR,
      keyResults: updatedKeyResults
    });
  };

  const removeKeyResult = (index: number) => {
    if (newOKR.keyResults.length > 1) {
      const updatedKeyResults = newOKR.keyResults.filter((_, i) => i !== index);
      setNewOKR({
        ...newOKR,
        keyResults: updatedKeyResults
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Novo OKR
        </button>
      </div>

      {/* Formulário de adição */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Novo OKR</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo
              </label>
              <textarea
                value={newOKR.objective}
                onChange={(e) => setNewOKR({...newOKR, objective: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Descreva o objetivo principal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultados-Chave
              </label>
              {newOKR.keyResults.map((kr, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={kr}
                    onChange={(e) => updateKeyResult(index, e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`Resultado-chave ${index + 1}`}
                  />
                  {newOKR.keyResults.length > 1 && (
                    <button
                      onClick={() => removeKeyResult(index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addKeyResult}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                + Adicionar resultado-chave
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Conclusão
              </label>
              <input
                type="date"
                value={newOKR.dueDate}
                onChange={(e) => setNewOKR({...newOKR, dueDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddOKR}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Salvar OKR
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de OKRs */}
      <div className="space-y-6">
        {okrs.map((okr) => (
          <div key={okr.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {okr.objective}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(okr.status)}`}>
                    {getStatusText(okr.status)}
                  </span>
                  <span>Vencimento: {new Date(okr.dueDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === okr.id ? null : okr.id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteOKR(okr.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progresso */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso</span>
                <span className="text-sm text-gray-600">{okr.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${okr.progress}%` }}
                />
              </div>
              {editingId === okr.id && (
                <div className="mt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={okr.progress}
                    onChange={(e) => handleUpdateProgress(okr.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Resultados-Chave */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Resultados-Chave:</h4>
              <ul className="space-y-2">
                {okr.keyResults.map((kr, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{kr}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {okrs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum OKR definido</h3>
          <p className="text-gray-500 mb-4">
            Comece criando seu primeiro OKR para definir objetivos claros e mensuráveis.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Criar primeiro OKR
          </button>
        </div>
      )}
    </div>
  );
};

export default OKR; 