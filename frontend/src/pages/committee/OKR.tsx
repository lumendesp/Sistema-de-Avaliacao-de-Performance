import React from 'react';
import OKR from '../../components/OKR';

const OKRPage: React.FC = () => {
  return (
    <OKR 
      userRole="committee"
      title="OKR - Objetivos e Resultados-Chave"
      description="Acompanhe os objetivos organizacionais"
    />
  );
};

export default OKRPage; 