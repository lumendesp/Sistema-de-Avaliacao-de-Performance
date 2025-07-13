import React from 'react';
import PDI from '../../components/PDI';

const PDIPage: React.FC = () => {
  return (
    <PDI 
      userRole="manager"
      title="PDI - Plano de Desenvolvimento Individual"
      description="Acompanhe o desenvolvimento dos seus colaboradores"
    />
  );
};

export default PDIPage; 