import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/solid';

interface FileUploadProps {
  onFilesAccepted: (file: File[]) => void;
  acceptedFileType: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAccepted, acceptedFileType }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesAccepted(acceptedFiles);
    }
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
        ${isDragActive ? 'border-[#08605F] bg-[#08605F]/10' : 'border-[#08605F]/40 hover:border-[#08605F]'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <DocumentArrowUpIcon className="w-12 h-12 text-[#08605F] mb-4" />
        {isDragActive ? (
          <p className="text-[#08605F] font-semibold">Solte o arquivo aqui...</p>
        ) : (
          <p className="text-gray-500">
            Arraste e solte o arquivo aqui, ou{' '}
            <span className="font-semibold text-[#08605F]">clique para selecionar</span>.
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">Suportado: {acceptedFileType}</p>
      </div>
    </div>
  );
};

export default FileUpload;