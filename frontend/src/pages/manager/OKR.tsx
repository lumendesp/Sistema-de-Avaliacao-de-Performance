import React from 'react';
import OKR from '../../components/OKR';

const OKRPage: React.FC = () => {
  return (
    <OKR 
      userRole="manager"
      title="OKR - Objetivos e Resultados-Chave"
      description="Defina e acompanhe seus objetivos estratégicos"
    />
  );
};

export default OKRPage; 