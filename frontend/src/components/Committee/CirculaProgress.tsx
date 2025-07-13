interface CircularProgressProps {
    percentage: number;
  }
  
  const getColor = (percentage: number) => {
    if (percentage > 50) return { border: "#08605F", text: "#08605F" }; // Verde
    if (percentage >= 30) return { border: "#F5C130", text: "#F5C130" }; // Amarelo
    return { border: "#dc2626", text: "#dc2626" }; // Vermelho
  };

  
  export default function CircularProgress({ percentage }: CircularProgressProps) {
    const radius = 50;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset =
      circumference - (percentage / 100) * circumference;
  
    const { border, text } = getColor(percentage);
  
    return (
      <div className="relative w-24 h-24">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#e5e7eb" 
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={border}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold" style={{ color: text }}>
            {percentage}%
          </span>
        </div>
      </div>
    );
  }
  