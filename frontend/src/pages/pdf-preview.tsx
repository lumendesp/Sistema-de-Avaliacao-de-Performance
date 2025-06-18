import React, { useEffect, useState } from 'react';

interface EvaluationData {
    name: string;
    role: string;
    autoAvaliacao: number;
    avaliacao360: number;
    notaGestor: number;
    notaFinal: number;
    resumo: string;
}

const PdfPreview: React.FC = () => {
    const [data, setData] = useState<EvaluationData | null>(null);

    useEffect(() => {
        // Get data from URL parameters
        const params = new URLSearchParams(window.location.search);
        const evaluationData = params.get('data');
        
        if (evaluationData) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(evaluationData));
                setData(parsedData);
            } catch (error) {
                console.error('Error parsing evaluation data:', error);
            }
        }
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ 
            padding: '40px',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <h1 style={{ 
                textAlign: 'center',
                color: '#1a365d',
                marginBottom: '40px'
            }}>
                Avaliação de Performance
            </h1>

            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Informações do Colaborador</h2>
                <p><strong>Nome:</strong> {data.name}</p>
                <p><strong>Cargo:</strong> {data.role}</p>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>Notas</h2>
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                }}>
                    <div style={{ 
                        padding: '15px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ color: '#4a5568', marginBottom: '10px' }}>Auto Avaliação</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                            {data.autoAvaliacao.toFixed(1)}
                        </p>
                    </div>
                    <div style={{ 
                        padding: '15px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ color: '#4a5568', marginBottom: '10px' }}>Avaliação 360°</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                            {data.avaliacao360.toFixed(1)}
                        </p>
                    </div>
                    <div style={{ 
                        padding: '15px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ color: '#4a5568', marginBottom: '10px' }}>Nota do Gestor</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                            {data.notaGestor.toFixed(1)}
                        </p>
                    </div>
                    <div style={{ 
                        padding: '15px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ color: '#4a5568', marginBottom: '10px' }}>Nota Final</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
                            {data.notaFinal.toFixed(1)}
                        </p>
                    </div>
                </div>
            </div>

            {data.resumo && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ color: '#2d3748', marginBottom: '20px' }}>Resumo</h2>
                    <div style={{ 
                        padding: '20px',
                        backgroundColor: '#f7fafc',
                        borderRadius: '8px',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {data.resumo}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfPreview; 