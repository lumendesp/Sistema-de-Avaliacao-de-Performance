interface InfoCardProps {
    name: string;
    description: string;
    image?: string;
    number?: number;
    subName?: string;
    warningColor?: 'green' | 'yellow' | 'red';
}

function InfoCard({ 
    name, 
    description, 
    image, 
    number, 
    subName,
    warningColor = 'green' 
}: InfoCardProps) {
    const warningColors = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        white: 'bg-white-500'
    };

    return (
        <div className="w-[400px] h-[120px] bg-white rounded-xl shadow-md p-4 flex justify-between">        
            {/* Left section with warning bar */}
            <div className="flex-1 relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${warningColors[warningColor]} rounded-l`} />
                <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
            </div>

            {/* Right section with image and number */}
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
                    <span className="text-2xl font-bold text-gray-800">{number}</span>
                )}
                {subName && (
                    <span className="text-sm text-gray-600">{subName}</span>
                )}
                </div>
            )}
            </div>

        </div>
    );
}

export default InfoCard;