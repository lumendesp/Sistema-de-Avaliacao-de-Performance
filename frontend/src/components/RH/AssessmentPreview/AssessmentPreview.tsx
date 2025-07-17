// src/components/AssessmentPreview.tsx
import React from 'react';
import ScoreDisplay from '../ScoreDisplay/ScoreDisplay';
import { type AssessmentScores } from '../../../types/evaluations';

interface AssessmentPreviewProps {
    scores: AssessmentScores;
}

const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({ scores }) => {
    return (
        <div className="grid grid-cols-5 gap-2 text-center">
            <ScoreDisplay label="Autoavaliação" value={scores.autoAvaliacao} />
            <ScoreDisplay label="Avaliação 360" value={scores.avaliacao360} />
            <ScoreDisplay label="Nota mentor" value={scores.notaMentor} /> 
            <ScoreDisplay label="Nota gestor" value={scores.notaGestor} />
            <ScoreDisplay label="Nota final" value={scores.notaFinal} />
        </div>
    );
};

export default AssessmentPreview;