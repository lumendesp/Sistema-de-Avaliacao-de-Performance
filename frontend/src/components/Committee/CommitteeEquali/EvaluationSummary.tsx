import React, { useState } from "react";
import CommitteeStarRating from "../CommitteeStarRating";
import html2canvas from 'html2canvas';
import jsPDF from "jspdf";
import downloadIcon from '../../../assets/committee/pdf-download.png';
import GenAITextBox from "./GenAITextBox";
import { exportEvaluationToExcel, exportEvaluationToCSV, createSampleEvaluationData, transformBackendDataToExport } from '../../../services/export.service';

interface CriterionProps {
    name: string;
    score: number;
}

const Criterion = ({ name, score }: CriterionProps) => {


    const getColorClass = (score: number) => {
        if (score >= 4) return 'text-[#419958]';
        if (score >= 3) return 'text-[#F5AA30]';
        return 'text-red-600';
    };

    const getBarColorClass = (score: number) => {
        if (score >= 4) return 'bg-[#08605F]';
        if (score >= 3) return 'bg-[#F5C130]';
        return 'bg-red-600';
    };

    const adjustScoreBar = (score:number) => {
        if(score > 5){
            score = 5
        }
        return (score / 5) * 100;
    }

    return (
        <div className="flex flex-col items-center gap-2 w-full sm:w-1/3">
            <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">{name}</span>
                <span className={`text-xs sm:text-sm font-bold ${getColorClass(score)}`}>
                    {score.toFixed(1)}
                </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                    className={`h-full rounded-full ${getBarColorClass(score)}`}
                    style={{ width: `${adjustScoreBar(score)}%` }}
                />
            </div>
        </div>
    );
};

interface EvaluationSummaryProps {
    userId: number;
    name: string;
    role: string;
    autoAvaliacao: number;
    avaliacao360: number;
    notaMentor: number;
    notaGestor: number;
    notaFinal?: number;
    onEdit?: () => void;
    onDownload?: () => void;
    onStarRating?: (score: number) => void;
    onJustification?: (text: string) => void;
    onConcluir?: () => void;
    currentScore?: number;
    currentJustification?: string;
    isEditing?: boolean;
    justificativaAutoAvaliacao?: string;
    justificativaMentor?: string;
    justificativaGestor?: string;
    justificativa360?: string;
    backendData?: any;
    cycleId: number;
}

function EvaluationSummary({ 
    userId,
    name,
    role,
    autoAvaliacao, 
    avaliacao360, 
    notaMentor,
    notaGestor, 
    notaFinal,
    onEdit,
    onStarRating,
    onJustification,
    onConcluir,
    currentScore = 0,
    currentJustification = '',
    isEditing = false,
    justificativaAutoAvaliacao = '',
    justificativaMentor = '',
    justificativaGestor = '',
    justificativa360 = '',
    backendData,
    cycleId
}: EvaluationSummaryProps) {
    
    const hasAllGrades =
        typeof autoAvaliacao === 'number' &&
        typeof avaliacao360 === 'number' &&
        typeof notaMentor === 'number' &&
        typeof notaGestor === 'number' &&
        typeof notaFinal === 'number';
      
    const printRef = React.useRef<HTMLDivElement>(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showSpreadsheetOptions, setShowSpreadsheetOptions] = useState(false);

    const generateFilename = (extension: string) => {
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const semester = month <= 6 ? 1 : 2;

        return `${firstName}_${lastName}_${year}_${semester}.${extension}`;
    };

    const handleDownloadPdf = async () => {
        const element = printRef.current;
        if(!element){
            return
        }

        // Create a temporary div for PDF content
        const tempDiv = document.createElement('div');
        tempDiv.className = 'space-y-6';
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.width = '800px';
        tempDiv.style.padding = '40px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.innerHTML = `
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="font-size: 28px; color: #08605F; margin-bottom: 8px;">Avaliação de Performance</h1>
            </div>

            <div style="margin-bottom: 30px;">
                <h2 style="font-size: 20px; color: #333; margin-bottom: 4px;">${name}</h2>
                <p style="color: #666; font-size: 16px;">${role}</p>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div style="text-align: center; width: 23%;">
                    <h3 style="font-size: 14px; color: #666; margin-bottom: 8px;">Autoavaliação</h3>
                    <div style="font-size: 24px; font-weight: bold; color: ${autoAvaliacao >= 4 ? '#16a34a' : autoAvaliacao >= 3 ? '#ca8a04' : '#dc2626'}">
                        ${autoAvaliacao.toFixed(1)}
                    </div>
                </div>
                <div style="text-align: center; width: 23%;">
                    <h3 style="font-size: 14px; color: #666; margin-bottom: 8px;">Nota Gestor</h3>
                    <div style="font-size: 24px; font-weight: bold; color: ${notaGestor >= 4 ? '#16a34a' : notaGestor >= 3 ? '#ca8a04' : '#dc2626'}">
                        ${notaGestor.toFixed(1)}
                    </div>
                </div>
                <div style="text-align: center; width: 23%;">
                    <h3 style="font-size: 14px; color: #666; margin-bottom: 8px;">Nota Gestor</h3>
                    <div style="font-size: 24px; font-weight: bold; color: ${notaMentor >= 4 ? '#16a34a' : notaMentor >= 3 ? '#ca8a04' : '#dc2626'}">
                        ${notaMentor.toFixed(1)}
                    </div>
                </div>
                <div style="text-align: center; width: 23%;">
                    <h3 style="font-size: 14px; color: #666; margin-bottom: 8px;">Avaliação 360</h3>
                    <div style="font-size: 24px; font-weight: bold; color: ${avaliacao360 >= 4 ? '#16a34a' : avaliacao360 >= 3 ? '#ca8a04' : '#dc2626'}">
                        ${avaliacao360.toFixed(1)}
                    </div>
                </div>
                ${typeof notaFinal === 'number' ? `
                    <div style="text-align: center; width: 23%;">
                        <h3 style="font-size: 14px; color: #666; margin-bottom: 8px;">Nota Final</h3>
                        <div style="font-size: 24px; font-weight: bold; color: ${notaFinal >= 4 ? '#16a34a' : notaFinal >= 3 ? '#ca8a04' : '#dc2626'}">
                            ${notaFinal.toFixed(1)}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div style="margin-top: 40px;">
                <h3 style="font-size: 16px; color: #08605F; margin-bottom: 16px;">Justificativas das Avaliações</h3>
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">Autoavaliação (${autoAvaliacao.toFixed(1)})</h4>
                    <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background-color: #f9fafb; font-size: 13px; line-height: 1.4;">
                        ${backendData?.justificativaAutoAvaliacao || justificativaAutoAvaliacao || 'Justificativa não disponível'}
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">Avaliação do Mentor (${notaMentor.toFixed(1)})</h4>
                    <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background-color: #f9fafb; font-size: 13px; line-height: 1.4;">
                        ${backendData?.justificativaMentor || justificativaMentor || 'Justificativa não disponível'}
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">Avaliação do Gestor (${notaGestor.toFixed(1)})</h4>
                    <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background-color: #f9fafb; font-size: 13px; line-height: 1.4;">
                        ${backendData?.justificativaGestor || justificativaGestor || 'Justificativa não disponível'}
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">Avaliação 360° (${avaliacao360.toFixed(1)})</h4>
                    <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background-color: #f9fafb; font-size: 13px; line-height: 1.4;">
                        ${backendData?.justificativa360 || justificativa360 || 'Justificativa não disponível'}
                    </div>
                </div>
                ${typeof notaFinal === 'number' ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">Avaliação Final do Comitê (${notaFinal.toFixed(1)})</h4>
                        <div style="border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background-color: #f9fafb; font-size: 13px; line-height: 1.4;">
                            ${currentJustification || 'Justificativa não disponível'}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
        `;

        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv)
        const data = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
            orientation:"portrait",
            unit:"px",
            format:"a4"
        });

        const imgPropertis = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgPropertis.height * pdfWidth) / imgPropertis.width;

        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight+20);
        pdf.save(generateFilename('pdf'));

        // Remove temporary div
        document.body.removeChild(tempDiv);
        
        // Close modals
        setShowSpreadsheetOptions(false);
        setShowDownloadModal(false);
    }

    // CSV/Excel download logic
    const handleDownloadSpreadsheet = (type: 'csv' | 'xlsx') => {
        // Use real backend data if available, otherwise use sample data
        const evaluationData = backendData 
            ? transformBackendDataToExport(backendData)
            : createSampleEvaluationData(name, `${name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`);
        
        if (type === 'csv') {
            exportEvaluationToCSV(evaluationData);
        } else {
            exportEvaluationToExcel(evaluationData);
        }
        
        // Close modals
        setShowSpreadsheetOptions(false);
        setShowDownloadModal(false);
    };

    const handleCloseModals = () => {
        setShowSpreadsheetOptions(false);
        setShowDownloadModal(false);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Download Modal */}
            {showDownloadModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-xs sm:max-w-sm flex flex-col items-center">
                        {!showSpreadsheetOptions ? (
                            <>
                                <div className="flex flex-col w-full space-y-2 sm:space-y-3">
                                    <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center">Escolha o formato de download</h2>
                                    <button
                                        className="px-4 sm:px-6 py-2 bg-[#08605F] text-white rounded hover:bg-[#064a49] w-full"
                                        onClick={() => setShowSpreadsheetOptions(true)}
                                    >
                                        Planilha
                                    </button>
                                    <button
                                        className="mb-2 sm:mb-3 px-4 sm:px-6 py-2 bg-gray-250 text-gray-800 rounded hover:bg-gray-300 w-full"
                                        onClick={() => {
                                            handleDownloadPdf();
                                        }}
                                    >
                                        PDF
                                    </button>
                                    <button
                                        className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500 hover:underline"
                                        onClick={handleCloseModals}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col w-full space-y-2 sm:space-y-3">
                                    <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-center">Escolha o formato da planilha</h2>
                                    <button
                                        className="px-4 sm:px-6 py-2 bg-[#08605F] text-white rounded hover:bg-[#064a49] w-full"
                                        onClick={() => handleDownloadSpreadsheet('xlsx')}
                                    >
                                        Excel
                                    </button>
                                    <button
                                        className="mb-2 sm:mb-3 px-4 sm:px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 w-full"
                                        onClick={() => handleDownloadSpreadsheet('csv')}
                                    >
                                        CSV
                                    </button>
                                    <button
                                        className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-500 hover:underline"
                                        onClick={() => setShowSpreadsheetOptions(false)}
                                    >
                                        Voltar
                                    </button>
                                </div>
                            </>

                        )}
                    </div>
                </div>
            )}

            {/* Content for PDF */}
            <div ref={printRef} className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                    <Criterion name="Autoavaliação" score={autoAvaliacao} />
                    <Criterion name="Avaliação 360" score={avaliacao360} />
                    <Criterion name="Nota Gestor" score={notaGestor} />
                    <Criterion name="Nota Mentor" score={notaMentor} />
                    {typeof notaFinal === 'number' && (
                        <Criterion name="Nota Final" score={notaFinal} />
                    )}
                </div>

                <div className="w-full">
                    <GenAITextBox userId={userId} cycleId={cycleId}/>
                </div>

            </div>

            {(!hasAllGrades || isEditing) ? (
                <>
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Dê uma avaliação de 0 à 5</h3>
                        <CommitteeStarRating 
                            score={currentScore} 
                            onChange={onStarRating || (() => {})} 
                        />
                    </div>
                    
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Justifique sua nota</h3>
                        <textarea 
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08605F]"
                            rows={4}
                            placeholder="Justifique sua nota"
                            value={currentJustification}
                            onChange={(e) => onJustification?.(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                        <button
                            className="px-4 py-2 bg-[#08605F] text-white rounded-md hover:bg-[#064a49] transition-colors"
                            onClick={onConcluir}
                        >
                            Concluir
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <button 
                        onClick={() => setShowDownloadModal(true)}
                        className="px-4 py-2 text-[#08605F] border border-[#08605F] rounded-md hover:bg-gray-100 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <img src={downloadIcon} alt="Download PDF" className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onEdit}
                        className="px-4 py-2 text-[#08605F] border border-[#08605F] rounded-md hover:bg-[#08605F] hover:text-white transition-colors"
                    >
                        Editar Avaliação
                    </button>
                </div>
            )}
        </div>
    );
}

export default EvaluationSummary; 