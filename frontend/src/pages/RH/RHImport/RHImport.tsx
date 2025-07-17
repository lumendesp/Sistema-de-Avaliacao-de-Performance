import React, { useState, useEffect } from 'react';
import type { EvaluationCycle, BulkImportResult, FileProcessResult } from '../../../types/rh';
import { importSingleHistoryRequest, importBulkHistoryRequest, getEvaluationCycles } from '../../../services/api';
import FileUpload from '../../../components/RH/FileUpload/FileUpload';
import { TrashIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// Função auxiliar para formatar o tamanho do arquivo
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const RHImport: React.FC = () => {
    const [cycles, setCycles] = useState<EvaluationCycle[]>([]);
    const [selectedCycleId, setSelectedCycleId] = useState<string>('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const fetchCycles = async () => {
            try {
                const data = await getEvaluationCycles();
                setCycles(data);
                // Seleciona o primeiro ciclo da lista como padrão
                if (data.length > 0) {
                    setSelectedCycleId(String(data[0].id));
                }
            } catch (error) {
                console.error("Falha ao buscar ciclos.");
            }
        };
        fetchCycles();
    }, []);

    // Função para adicionar novos arquivos à lista
    const handleFilesAccepted = (files: File[]) => {
        // Map para garantir que não haja arquivos com o mesmo nome na lista
        const fileMap = new Map<string, File>();
        [...selectedFiles, ...files].forEach(file => fileMap.set(file.name, file));
        setSelectedFiles(Array.from(fileMap.values()));
    };

    // Função para remover um arquivo da lista
    const handleRemoveFile = (fileName: string) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const handleImport = async () => {
        if (selectedFiles.length === 0 || !selectedCycleId) {
            alert('Por favor, selecione um ciclo e pelo menos um arquivo.');
            return;
        }

        setIsLoading(true);
        setImportResult(null);
        setShowDetails(false);
        const overallResults: FileProcessResult[] = [];

        // Loop 'for...of' para processar os arquivos sequencialmente
        for (const file of selectedFiles) {
            try {
                let result;
                const cycleId = Number(selectedCycleId);

                // Decide qual endpoint chamar com base no tipo de arquivo
                if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                    result = await importBulkHistoryRequest(file, cycleId);
                    // O resultado do bulk já é um array, então o adicionamos
                    overallResults.push(...result.results);
                } else {
                    const singleResult = await importSingleHistoryRequest(file, cycleId);
                    overallResults.push({ status: 'success', fileName: file.name, data: singleResult });
                }
            } catch (error: any) {
                overallResults.push({ status: 'error', fileName: file.name, reason: error.message || 'Erro desconhecido' });
            }
        }

        setImportResult({
            message: "Processamento de lote concluído.",
            totalFiles: selectedFiles.length,
            results: overallResults
        });
        setIsLoading(false);
        setSelectedFiles([]); // Limpa a lista de arquivos após a importação
    };

    const summary = importResult ? {
        successCount: importResult.results.filter(r => r.status === 'success').length,
        errorCount: importResult.results.filter(r => r.status === 'error').length,
    } : { successCount: 0, errorCount: 0 };

    return (
        <>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Importar Histórico</h1>

            <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <div>
                    <label htmlFor="cycle-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Selecione o Ciclo de Avaliação
                    </label>
                    <select
                        id="cycle-select"
                        value={selectedCycleId}
                        onChange={(e) => setSelectedCycleId(e.target.value)}
                        className="max-w-xs p-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        {cycles.map(cycle => (
                            <option key={cycle.id} value={cycle.id}>
                                Ciclo {cycle.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Faça o upload dos arquivos (.zip ou .xlsx)
                    </label>
                    <FileUpload onFilesAccepted={handleFilesAccepted} acceptedFileType=".zip, .xlsx" />
                    {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h3 className="font-semibold text-gray-700">Arquivos Selecionados:</h3>

                            <ul className="border rounded-md divide-y">
                                {selectedFiles.map(file => (
                                    <li key={file.name} className="p-3 flex flex-col md:flex-row md:justify-between md:items-center text-sm hover:bg-gray-50">

                                        <div className="flex-1 min-w-0 pr-4">
                                            {/* Versão curta, visível apenas em telas pequenas */}
                                            <span className="font-medium text-gray-800 md:hidden">
                                                {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                                            </span>
                                            {/* Versão completa, visível apenas em telas médias e maiores */}
                                            <span className="font-medium text-gray-800 hidden md:inline">
                                                {file.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between w-full md:w-auto md:gap-3">
                                            <span className="text-gray-500">{formatBytes(file.size)}</span>
                                            <button onClick={() => handleRemoveFile(file.name)} className="text-red-400 hover:text-red-600 transition-colors">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="border-t pt-6">
                    <button
                        onClick={handleImport}
                        disabled={selectedFiles.length === 0 || !selectedCycleId || isLoading}
                        className="w-full md:w-auto px-6 py-2.5 bg-[#08605F] text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Importando...' : `Importar ${selectedFiles.length} arquivo(s)`}
                    </button>
                </div>
            </div>

            {importResult && (
                <div className="mt-8 bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4">Resultado da Importação</h2>

                    {/* Resumo Geral */}
                    <div className={'flex flex-col md:flex-row md:items-center md:gap-6 p-4 rounded-lg bg-gray-50 border'}>

                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            {summary.errorCount === 0 && (
                                <CheckCircleIcon className="h-10 w-10 text-green-500" />
                            )}
                            {summary.successCount === 0 && summary.errorCount > 0 && (
                                <XCircleIcon className="h-10 w-10 text-red-500" />
                            )}
                            {summary.successCount > 0 && summary.errorCount > 0 && (
                                <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" />
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                            <p className="font-semibold text-gray-800">
                                {summary.errorCount === 0
                                    ? `Todos os ${summary.successCount} arquivos foram importados com sucesso!`
                                    : `${summary.successCount} de ${importResult.totalFiles} arquivos importados com sucesso.`}
                            </p>
                            {summary.errorCount > 0 && (
                                <p className="text-sm text-red-600">{summary.errorCount} arquivo(s) falhou(aram).</p>
                            )}
                        </div>

                        <div className="text-center md:text-left mt-4 md:mt-0">
                            <button
                                onClick={() => setShowDetails(prev => !prev)}
                                className="px-4 py-2 text-sm font-medium text-[#08605F] hover:bg-[#08605F]/5 rounded-md"
                            >
                                {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                            </button>
                        </div>
                    </div>

                    {/* Lista Detalhada */}
                    {showDetails && importResult.results && (
                        <ul className="mt-4 space-y-2 border-t pt-4">
                            {importResult.results.map((res, index) => (
                                <li key={index} className={`p-3 rounded-md ${res.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    <div>
                                        <p className="font-semibold md:hidden">
                                            {res.fileName.length > 15 ? `${res.fileName.substring(0, 15)}...` : res.fileName}
                                        </p>
                                        <p className="font-semibold hidden md:block">
                                            {res.fileName}
                                        </p>
                                    </div>
                                    <p className="text-sm">{res.status === 'success' ? `Sucesso: ${res.data?.message}` : `Erro: ${res.reason}`}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </>
    );
};

export default RHImport;