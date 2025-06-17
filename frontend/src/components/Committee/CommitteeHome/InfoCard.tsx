interface InfoCardProps {
    name: string;
    description: string;
    image?: string;
    number?: number;
    subName?: string;
    warningColor?: 'green' | 'yellow' | 'red' | 'white';
    bgColor?: 'green' | 'white';
    textColor?: 'grey' | 'white';
}

function InfoCard({ 
    name, 
    description, 
    image, 
    number, 
    subName,
    warningColor = 'green',
    bgColor = 'white',
    textColor = 'grey'
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

    return (
        <div className={`w-[400px] h-[120px] ${backgroundColors[bgColor]} rounded-xl shadow-md p-4 flex justify-between`}>        
            <div className="flex-1 relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${warningColors[warningColor]} rounded-l`} />
                <div className="ml-3">
                    <h2 className={`text-lg font-semibold ${textColors[textColor]}`}>{name}</h2>
                    <p className={`text-sm ${textColor === 'white' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{description}</p>
                </div>
            </div>

            <div className="flex items-center ml-4">
                {image && (
                    <img 
                        src={image} 
                        alt={name} 
                        className="w-12 h-12 object-contain mb-2"
                    />
                )}
                {(number !== undefined || subName) && (
                    <div className="flex flex-col ml-2">
                        {number !== undefined && (
                            <span className={`text-2xl font-bold ${textColors[textColor]}`}>{number}</span>
                        )}
                        {subName && (
                            <span className={`text-sm ${textColor === 'white' ? 'text-gray-300' : 'text-gray-600'}`}>{subName}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InfoCard;