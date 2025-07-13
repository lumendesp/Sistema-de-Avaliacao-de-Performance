import React from 'react';
import OKR from '../../components/OKR';

const OKRPage: React.FC = () => {
  return (
    <OKR 
      userRole="hr"
      title="OKR - Objetivos e Resultados-Chave"
      description="Gerencie os objetivos organizacionais"
    />
  );
};

export default OKRPage; 