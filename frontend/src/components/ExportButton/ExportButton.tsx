import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { exportEvaluationToExcel, exportEvaluationToCSV, transformBackendDataToExport, createSampleEvaluationData } from '../../services/export.service';

interface ExportButtonProps {
  data?: any; // Backend data
  userName?: string;
  userEmail?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  userName = 'Usuário',
  userEmail = 'usuario@empresa.com',
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = (type: 'csv' | 'xlsx') => {
    // Use real backend data if available, otherwise use sample data
    const evaluationData = data 
      ? transformBackendDataToExport(data)
      : createSampleEvaluationData(userName, userEmail);
    
    if (type === 'csv') {
      exportEvaluationToCSV(evaluationData);
    } else {
      exportEvaluationToExcel(evaluationData);
    }
    
    setShowOptions(false);
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-[#08605F] text-white hover:bg-[#064a49] focus:ring-[#08605F]',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border border-[#08605F] text-[#08605F] hover:bg-[#08605F] hover:text-white focus:ring-[#08605F]'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={getButtonClasses()}
      >
        <FaDownload className="w-4 h-4" />
        Exportar
      </button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowOptions(false)}
          />
          
          {/* Modal */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => handleExport('xlsx')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Exportar CSV (.csv)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton; 