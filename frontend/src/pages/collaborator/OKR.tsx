import React from 'react';
import OKR from '../../components/OKR';

const OKRPage: React.FC = () => {
  return (
    <OKR 
      userRole="collaborator"
      title="Meus OKRs"
      description="Acompanhe seus objetivos e resultados-chave pessoais"
    />
  );
};

export default OKRPage; 