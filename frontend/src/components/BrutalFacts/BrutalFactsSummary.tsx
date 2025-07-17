import React, { useEffect, useState } from 'react';
import { API_URL } from '../../services/api';
import AIIcon from '../../assets/committee/AI-icon.png';

interface BrutalFactsSummaryData {
  insights: string;
  averageAuto?: string;
  averageManager?: string;
  averagePeer?: string;
  averageFinal?: string;
  cycleName?: string;
  totalEvaluated?: string;
}

const BrutalFactsSummary: React.FC = () => {
  const [data, setData] = useState<BrutalFactsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/ciclos/brutal-facts`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar insights');
        const respData = await res.json();
        setData(respData);
      } catch (err: any) {
        setData({ insights: 'Erro ao carregar insights. Tente novamente.' });
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  // Função utilitária para limpar caracteres especiais repetidos
  function cleanSpecialChars(text: string) {
    if (!text) return text;
    // Remove repetições de *, #, -, _ e espaços extras
    return text
      .replace(/([*#\-_])\1{1,}/g, '$1') // Reduz sequências como *** ou ### para * ou #
      .replace(/\n{3,}/g, '\n\n') // No máximo duas quebras de linha seguidas
      .replace(/\s{3,}/g, '  '); // No máximo dois espaços seguidos
  }

  if (loading) {
    return (
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 border-l-4 border-l-[#08605F] pl-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <img src={AIIcon} alt="IA Icon" className="w-4 h-4" />
            <span className="text-sm font-semibold text-gray-700">Resumo</span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            Carregando insights...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 border-l-4 border-l-[#08605F] pl-6 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <img src={AIIcon} alt="IA Icon" className="w-4 h-4" />
          <span className="text-sm font-semibold text-gray-700">Resumo</span>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {data?.insights ? cleanSpecialChars(data.insights) : 'Resumo não disponível.'}
        </div>
      </div>
      <div className="mb-2">
        <span className="text-xs text-gray-500 font-semibold">Ciclo: {data?.cycleName || '-'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-500">
        <div><span className="font-semibold text-gray-600">Média Autoavaliação:</span> {data?.averageAuto || '-'}</div>
        <div><span className="font-semibold text-gray-600">Média Gestor:</span> {data?.averageManager || '-'}</div>
        <div><span className="font-semibold text-gray-600">Média 360:</span> {data?.averagePeer || '-'}</div>
        <div><span className="font-semibold text-gray-600">Média Final:</span> {data?.averageFinal || '-'}</div>
        <div><span className="font-semibold text-gray-600">Total avaliados:</span> {data?.totalEvaluated || '-'}</div>
      </div>
    </div>
  );
};

export default BrutalFactsSummary; 