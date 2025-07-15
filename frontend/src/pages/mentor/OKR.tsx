import React from 'react';
import OKR from '../../components/OKR';

const OKRPage: React.FC = () => {
  return (
    <OKR 
      userRole="mentor"
      title="OKR - Objetivos e Resultados-Chave"
      description="Acompanhe os objetivos dos seus mentorados"
    />
  );
};

export default OKRPage; 