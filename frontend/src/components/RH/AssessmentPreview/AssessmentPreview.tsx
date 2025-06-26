// src/components/AssessmentPreview.tsx
import React from 'react';
import ScoreDisplay from '../ScoreDisplay/ScoreDisplay';
import { type AssessmentScores } from '../../../types/evaluations';

// A interface de props agora usa o tipo importado
interface AssessmentPreviewProps {
    scores: AssessmentScores;
}

const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({ scores }) => {
    return (
        <div className="flex items-center gap-4">
            <ScoreDisplay label="Autoavaliação" value={scores.autoAvaliacao} />
            <ScoreDisplay label="Avaliação 360" value={scores.avaliacao360} />
            <ScoreDisplay label="Nota gestor" value={scores.notaGestor} />
            <ScoreDisplay label="Nota final" value={scores.notaFinal} />
        </div>
    );
};

export default AssessmentPreview;