import type { ReactNode } from 'react';
import calendarGreen from '../../../assets/committee/calendar-green.png';
import calendarYellow from '../../../assets/committee/calendar-yellow.png';
import calendarRed from "../../../assets/committee/calendar-red.png"

interface InfoCardProps {
    name: string;
    description: string;
    image?: string;
    number?: number;
    subName?: string;
    warningColor?: 'green' | 'yellow' | 'red' | 'white';
    bgColor?: 'green' | 'white';
    textColor?: 'grey' | 'white';
    children?: ReactNode;
}

function InfoCard({ 
    name, 
    description, 
    image, 
    number, 
    subName,
    warningColor = 'green',
    bgColor = 'white',
    textColor = 'grey',
    children
}: InfoCardProps) {
    const warningColors = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        white: 'bg-white'
    };

    const backgroundColors = {
        green: 'bg-[#08605F]',
        white: 'bg-white'
    }

    const textColors = {
        white: 'text-white',
        grey: 'text-gray-800'
    }

    // Logic to determine calendar color and text color based on number of days
    const getCalendarColor = (days?: number) => {
        if (!days) return { image: image, textColor: textColor, warningColor: warningColor };
        
        if (days > 15) {
            return { 
                image: calendarGreen, 
                textColor: 'green' as const, 
                warningColor: 'green' as const 
            };
        } else if (days < 7) {
            return { 
                image: calendarRed, 
                textColor: 'red' as const, 
                warningColor: 'red' as const 
            };
        } else {
            return { 
                image: calendarYellow, 
                textColor: 'yellow' as const, 
                warningColor: 'yellow' as const 
            };
        }
    };

    // Only apply calendar logic if no image is provided (calendar cards)
    const calendarConfig = !image ? getCalendarColor(number) : { image: image, textColor: textColor, warningColor: warningColor };
    const finalImage = calendarConfig.image;
    const finalTextColor = calendarConfig.textColor || textColor;
    const finalWarningColor = calendarConfig.warningColor || warningColor;

    const dynamicTextColors = {
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
        white: 'text-white',
        grey: 'text-gray-800'
    };

    return (
        <div className={`w-full lg:w-[400px] h-auto min-h-[120px] ${backgroundColors[bgColor]} rounded-xl shadow-md p-4 flex flex-col sm:flex-row justify-between gap-4`}>        
            <div className="flex-1">
                <div className="ml-0 sm:ml-3">
                    <h2 className={`text-base sm:text-lg font-semibold ${textColors[textColor]} truncate`}>{name}</h2>
                    <div className="relative min-h-[48px] flex items-center"> {/* <- Altura mínima aqui */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${warningColors[finalWarningColor]} rounded`} />
                            <p 
                                className={`ml-2 text-xs sm:text-sm ${textColor === 'white' ? 'text-gray-300' : 'text-gray-600'} leading-tight`}
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {description}
                            </p>
                        </div>
                </div>
            </div>

            {children && (
                <div className="flex items-center justify-center mx-0 sm:mx-2 flex-shrink-0">
                    {children}
                </div>
            )}

 
            <div className="flex items-center justify-center sm:justify-end ml-0 sm:ml-2 flex-shrink-0">
                {finalImage && (
                    <img 
                        src={finalImage} 
                        alt={name} 
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-0 sm:mb-2"
                    />
                )}
                {(number !== undefined || subName) && (
                    <div className="flex flex-col ml-2 sm:ml-4 items-center">
                        {number !== undefined && (
                            <span className={`text-2xl sm:text-4xl font-bold ${dynamicTextColors[finalTextColor]}`}>{number}</span>
                        )}
                        {subName && (
                            <span className={`text-xs sm:text-sm ${dynamicTextColors[finalTextColor]}`}>{subName}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InfoCard;