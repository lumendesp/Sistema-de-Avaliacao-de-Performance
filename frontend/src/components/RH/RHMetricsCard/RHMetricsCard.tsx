import React from 'react';

interface RHMetricsCardProps {
    title: string;
    description: string;
    value: number | string;
    unit?: string;
    icon: React.ElementType; // Para usar ícones do Heroicons
    iconBgColor: string;
    iconColor: string;
}

const RHMetricsCard: React.FC<RHMetricsCardProps> = ({ title, description, value, unit, icon: Icon, iconBgColor, iconColor }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <div className="flex items-center gap-x-3 ml-4">
                <div className={`p-3 rounded-full ${iconBgColor}`}>
                    <Icon className={`h-19 w-19 ${iconColor}`} />
                </div>
                <div className="flex items-baseline text-right">
                    <span className="text-4xl font-bold text-gray-800">{value}</span>
                    {unit && <span className="text-lg text-gray-600 ml-1">{unit}</span>}
                </div>
            </div>
        </div>
    );
}

export default RHMetricsCard;