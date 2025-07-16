import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getSystemLogs, 
  exportSystemLogs, 
  getSystemStatus, 
  getSystemStats,
  getRecentLogs,
  deleteOldLogs
} from '../../services/api';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTracks: number;
  activeTracks: number;
  totalEvaluations: number;
  completedEvaluations: number;
  trackDistribution: Array<{ trackName: string; userCount: number }>;
}

interface SystemLog {
  id: number;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  action: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string | null;
  requestBody: string | null;
  responseStatus: number | null;
  responseTime: number | null;
  errorMessage: string | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface SystemStatus {
  server: 'online' | 'offline';
  database: 'connected' | 'disconnected';
  lastUpdate: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'system'>('overview');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    userEmail: '',
    method: '',
    path: '',
    ip: '',
    responseStatus: '',
    startDate: '',
    endDate: '',
    errorOnly: false,
  });
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTracks: 0,
    activeTracks: 0,
    totalEvaluations: 0,
    completedEvaluations: 0,
    trackDistribution: [],
  });
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    server: 'online',
    database: 'connected',
    lastUpdate: new Date().toLocaleString('pt-BR'),
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch system stats
        const systemStatsData = await getSystemStats();
        setStats(systemStatsData);

        // Fetch recent logs for overview
        const recentLogsData = await getRecentLogs(5);
        setLogs(recentLogsData);



        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleLogExpansion = (logId: number) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const fetchLogsForTab = async () => {
    if (activeTab === 'logs') {
      try {
        const logsData = await getSystemLogs({ limit: 50 });
        setLogs(logsData.logs || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    }
  };

  const applyFilters = async () => {
    try {
      const filterParams: any = { limit: 50 };
      
      // Add non-empty filters
      if (filters.userId) filterParams.userId = parseInt(filters.userId);
      if (filters.userEmail) filterParams.userEmail = filters.userEmail;
      if (filters.method) filterParams.method = filters.method;
      if (filters.path) filterParams.path = filters.path;
      if (filters.ip) filterParams.ip = filters.ip;
      if (filters.responseStatus) filterParams.responseStatus = parseInt(filters.responseStatus);
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;
      if (filters.errorOnly) filterParams.errorOnly = filters.errorOnly;

      const logsData = await getSystemLogs(filterParams);
      setLogs(logsData.logs || []);
      setShowFilters(false);
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      userEmail: '',
      method: '',
      path: '',
      ip: '',
      responseStatus: '',
      startDate: '',
      endDate: '',
      errorOnly: false,
    });
    fetchLogsForTab();
  };

  const handleDeleteOldLogs = async () => {
    if (window.confirm('Tem certeza que deseja deletar logs com mais de 1 semana? Esta ação não pode ser desfeita.')) {
      try {
        const result = await deleteOldLogs(7); // Delete logs older than 7 days
        alert(`Logs deletados com sucesso! ${result.deletedCount} logs removidos.`);
        fetchLogsForTab(); // Refresh logs
      } catch (error) {
        console.error('Error deleting old logs:', error);
        alert('Erro ao deletar logs antigos');
      }
    }
  };

  useEffect(() => {
    fetchLogsForTab();
  }, [activeTab]);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleExportLogs = async () => {
    try {
      const exportData = await exportSystemLogs();
      // Create and download CSV file
      const blob = new Blob([exportData.content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename || 'system-logs.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Erro ao exportar logs');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-main"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">
          Bem-vindo, {user?.name}.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-green-main text-green-main'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-green-main text-green-main'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Logs do Sistema
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* System Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuários</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-green-600">{stats.activeUsers} ativos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trilhas</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalTracks}</p>
                  <p className="text-xs text-blue-600">{stats.activeTracks} com usuários</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avaliações</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalEvaluations}</p>
                  <p className="text-xs text-green-600">{stats.completedEvaluations} concluídas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Logs Recentes</h3>
              <button 
                onClick={() => setActiveTab('logs')}
                className="text-sm text-green-main hover:text-green-700 font-medium"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(log.method)}`}>
                        {log.method}
                      </span>
                      <span className={`text-xs font-medium ${getStatusColor(log.responseStatus || 0)}`}>
                        {log.responseStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.userName || log.user?.name || 'Sistema'}</p>
                      <p className="text-xs text-gray-500">{log.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{log.ip}</p>
                    <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhum log encontrado</p>
              )}
            </div>
          </div>

          {/* Track Distribution */}
          {stats.trackDistribution && stats.trackDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Faixas</h3>
              <div className="space-y-3">
                {stats.trackDistribution.map((track, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">{track.trackName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{track.userCount}</p>
                      <p className="text-xs text-gray-500">usuários</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Logs do Sistema</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {showFilters ? 'Ocultar Filtros' : 'Filtrar'}
              </button>
              <button 
                onClick={handleDeleteOldLogs}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-md"
              >
                Deletar Logs Antigos
              </button>
              <button 
                onClick={handleExportLogs}
                className="px-4 py-2 text-sm font-medium text-white bg-green-main border border-transparent rounded-md"
              >
                Exportar
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID do Usuário</label>
                  <input
                    type="number"
                    value={filters.userId}
                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                    placeholder="Ex: 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email do Usuário</label>
                  <input
                    type="text"
                    value={filters.userEmail}
                    onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                    placeholder="Ex: user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método HTTP</label>
                  <select
                    value={filters.method}
                    onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                  >
                    <option value="">Todos</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caminho</label>
                  <input
                    type="text"
                    value={filters.path}
                    onChange={(e) => setFilters({ ...filters, path: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                    placeholder="Ex: /api/users"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP</label>
                  <input
                    type="text"
                    value={filters.ip}
                    onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                    placeholder="Ex: 192.168.1.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status de Resposta</label>
                  <input
                    type="number"
                    value={filters.responseStatus}
                    onChange={(e) => setFilters({ ...filters, responseStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                    placeholder="Ex: 200, 404, 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-main"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="errorOnly"
                    checked={filters.errorOnly}
                    onChange={(e) => setFilters({ ...filters, errorOnly: e.target.checked })}
                    className="h-4 w-4 text-green-main focus:ring-green-main border-gray-300 rounded"
                  />
                  <label htmlFor="errorOnly" className="ml-2 block text-sm text-gray-900">
                    Apenas erros
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-main border border-transparent rounded-md"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Main Log Info */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleLogExpansion(log.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(log.method)}`}>
                          {log.method}
                        </span>
                        <span className={`text-sm font-medium ${getStatusColor(log.responseStatus || 0)}`}>
                          {log.responseStatus}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{log.userName || 'Sistema'}</p>
                        <p className="text-xs text-gray-500">{log.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{log.ip}</p>
                        <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLogId === log.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Detalhes da Requisição</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Path:</span>
                            <span className="ml-2 text-gray-600">{log.path}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">User Agent:</span>
                            <span className="ml-2 text-gray-600">{log.userAgent || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Response Time:</span>
                            <span className="ml-2 text-gray-600">{log.responseTime}ms</span>
                          </div>
                          {log.requestBody && (
                            <div>
                              <span className="font-medium text-gray-700">Request Body:</span>
                              <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                                {JSON.stringify(JSON.parse(log.requestBody), null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Informações do Usuário</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">ID:</span>
                            <span className="ml-2 text-gray-600">{log.userId || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="ml-2 text-gray-600">{log.userEmail || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Nome:</span>
                            <span className="ml-2 text-gray-600">{log.userName || 'Sistema'}</span>
                          </div>
                          {log.errorMessage && (
                            <div>
                              <span className="font-medium text-red-700">Erro:</span>
                              <span className="ml-2 text-red-600">{log.errorMessage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;