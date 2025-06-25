import React from 'react';

interface ScoreDisplayProps {
    label: string;
    value?: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ label, value }) => (
    <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="w-16 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-gray-800 font-semibold text-sm">
                {typeof value === 'number' ? value.toFixed(1) : '-'}
            </span>
        </div>
    </div>
);

export default ScoreDisplay;