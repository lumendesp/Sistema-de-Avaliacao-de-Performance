import axios from 'axios';

interface EvaluationData {
    name: string;
    role: string;
    autoAvaliacao: number;
    avaliacao360: number;
    notaGestor: number;
    notaFinal: number;
    resumo: string;
}

export const generateEvaluationPdf = async (data: EvaluationData): Promise<void> => {
    try {
        console.log('Sending data to generate PDF:', data);
        
        const response = await axios.post('http://localhost:3000/pdf/evaluation-from-template', data, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/pdf',
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
        });

        // Check if the response is actually a PDF
        if (response.data.type === 'application/json') {
            // If it's JSON, it's probably an error message
            const reader = new FileReader();
            reader.onload = () => {
                const errorData = JSON.parse(reader.result as string);
                throw new Error(errorData.message || 'Failed to generate PDF');
            };
            reader.readAsText(response.data);
            return;
        }

        if (!response.data) {
            throw new Error('No PDF data received from server');
        }

        // Create a blob from the PDF data
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = `evaluation-${data.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        
        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
        console.error('Error generating PDF:', error);
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                
                // If the response is a blob, try to read it as text
                if (error.response.data instanceof Blob) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            const errorData = JSON.parse(reader.result as string);
                            throw new Error(errorData.message || `Server error: ${error.response?.status}`);
                        } catch (e) {
                            throw new Error(`Server error: ${error.response?.status}`);
                        }
                    };
                    reader.readAsText(error.response.data);
                    return;
                }
                
                throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                throw new Error('No response received from server. Please check if the server is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Request setup error:', error.message);
                throw new Error('Failed to set up the request: ' + error.message);
            }
        }
        throw new Error('An unexpected error occurred while generating the PDF: ' + (error instanceof Error ? error.message : String(error)));
    }
}; 